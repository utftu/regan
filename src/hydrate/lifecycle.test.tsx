import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {Fragment} from '../components/fragment/fragment.ts';
import {FC} from '../types.ts';
import {waitTime} from 'utftu';
import {insertAndHydrate} from '../utils/tests.ts';
import {createAtom} from 'strangelove';

describe('hydrate: жизненный цикл и пути', () => {
  describe('mount', () => {
    it('mount order', () => {
      const mounts: string[] = [];
      const Child1: FC = (_, ctx) => {
        ctx.mount(() => mounts.push('child1'));
        return <div id='child1'>child1</div>;
      };
      const Child2: FC = (_, ctx) => {
        ctx.mount(() => mounts.push('child2'));
        return <div>child2</div>;
      };

      const Parent: FC = (_, ctx) => {
        ctx.mount(() => mounts.push('parent'));
        return (
          <div>
            <div>parent</div>
            <Child1 />
            <Child2 />
          </div>
        );
      };
      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Parent />});

      expect(mounts[0]).toBe('parent');
      expect(mounts[1]).toBe('child1');
      expect(mounts[2]).toBe('child2');
    });
  });

  it('child atoms', () => {
    const onClickElement = vi.fn();
    const onClickChild = vi.fn();
    const Child = () => {
      return (
        <div id='child' click={onClickChild}>
          child
        </div>
      );
    };
    const Parent = () => {
      return (
        <div>
          <div id='parent' click={onClickElement}>
            parent
          </div>
          {createAtom(<Child />)}
        </div>
      );
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Parent />});

    const div = jsdom.window.document.getElementById('child')!;
    div.click();
    expect(onClickChild.mock.calls.length).toBe(1);
    div.click();
    expect(onClickChild.mock.calls.length).toBe(2);

    const parentElem = jsdom.window.document.getElementById('parent')!;
    parentElem.click();
    expect(onClickElement.mock.calls.length).toBe(1);
  });

  it('jsxPath', () => {
    let level3JsxPath!: string;
    const Level3: FC = (_, ctx) => {
      level3JsxPath = ctx.getJsxPath();
      return <div>level3</div>;
    };
    const Level2 = () => {
      // 0
      return <Level3 />;
    };
    const level1Atom = createAtom(<Level2 />);
    const Level1 = () => {
      return (
        <div>
          level1
          <div>empty</div>
          <div>empty</div>
          {/* 0.2(atom-wrapper)?a=0.0(fragment).0(component) */}
          {level1Atom}
        </div>
      );
    };
    const Level0 = () => {
      return (
        <div>
          <div>parent</div>
          {/* 0.1.0 */}
          <Fragment>
            <Level1 />
          </Fragment>
        </div>
      );
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Level0 />});
    expect(level3JsxPath).toBe('0.1.0.0.2?a=0.0.0.0');
  });

  it('child', () => {
    const childClick = vi.fn();
    const Child = () => {
      waitTime(30);

      return (
        <div id='child' click={childClick}>
          child
        </div>
      );
    };

    const Parent = () => {
      return (
        <div>
          <Child />
        </div>
      );
    };

    const jsdom = new JSDOM();

    insertAndHydrate({jsdom, jsxNode: <Parent />});
    jsdom.window.document.getElementById('child')!.click();

    expect(childClick.mock.calls.length).toBe(1);
  });
});
