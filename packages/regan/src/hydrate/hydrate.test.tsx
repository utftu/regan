import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {Fragment} from '../components/fragment/fragment.ts';
import {FC} from '../types.ts';
import {waitTime} from 'utftu';
import {insertAndHydrate} from '../utils/tests.ts';
import {createAtom} from 'strangelove';

describe('hydrate', () => {
  describe('child', () => {
    it('child element', () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <div id='div' click={onClick}>
            component
          </div>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component', () => {
      debugger;
      const onClick = vi.fn();
      const Child = () => {
        return (
          <div id='child' click={onClick}>
            child
          </div>
        );
      };
      const Parent = () => {
        return (
          <div id='wrapper'>
            <div id='parent'>123</div>
            <Child id='child-component' />
          </div>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('child')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component with fragment', () => {
      const onClick = vi.fn();
      const Child = () => {
        return (
          <Fragment>
            <div id='div' click={onClick}>
              child
            </div>
          </Fragment>
        );
      };
      const Parent = () => {
        return <Child />;
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
  });
  describe('fragment', () => {
    it('fragment signle', () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <Fragment id='fragment global'>
            <div id='div1'>div1</div>
            <Fragment id='fragment over two'>
              <div id='div2' click={onClick}>
                div2
              </div>
            </Fragment>
            <div id='div3'>div3</div>
          </Fragment>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div2')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('fragment many', () => {
      const onClickDiv3 = vi.fn();
      const onClickDiv4 = vi.fn();
      const Component = () => {
        return (
          <Fragment>
            <div id='div1'>div1</div>
            <Fragment id='fragment over two'>
              <div id='div2'>div2</div>
              <div id='div3' click={onClickDiv3}>
                div3
              </div>
            </Fragment>
            <div id='div4' click={onClickDiv4}>
              div4
            </div>
          </Fragment>
        );
      };

      const jsdom = new JSDOM();

      insertAndHydrate({jsdom, jsxNode: <Component />});

      const div3 = jsdom.window.document.getElementById('div3')!;
      const div4 = jsdom.window.document.getElementById('div4')!;

      div3.click();
      expect(onClickDiv3.mock.calls.length).toBe(1);
      div3.click();
      expect(onClickDiv3.mock.calls.length).toBe(2);

      div4.click();
      expect(onClickDiv4.mock.calls.length).toBe(1);
    });
  });
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
  it('nodeCount', () => {
    const childClick = vi.fn();
    const Component = () => {
      return (
        <div>
          <div>child1</div>
          child2 child3
          <div id='child4' click={childClick}>
            child4
          </div>
        </div>
      );
    };

    const jsdom = new JSDOM();
    insertAndHydrate({jsdom, jsxNode: <Component />});
    const child4 = jsdom.window.document.getElementById('child4')!;
    child4.click();
    expect(childClick.mock.calls.length).toBe(1);
  });
});
