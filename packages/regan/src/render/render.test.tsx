import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {FC} from '../types.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {Atom, atom} from 'strangelove';
import {render} from './render.ts';

describe('render', () => {
  it('markup', async () => {
    const Child: FC = () => {
      return (
        <div>
          <Fragment>child</Fragment>
        </div>
      );
    };

    const Parent: FC = () => {
      return (
        <Fragment>
          <div>
            <div>parent</div>
            <Child />
          </div>
        </Fragment>
      );
    };

    const jsdom = new JSDOM();

    await render(jsdom.window.document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });

    expect(jsdom.window.document.body.innerHTML).toBe(
      '<div><div>parent</div><div>child</div></div>'
    );
  });
  it('listeners', async () => {
    const parentClick = vi.fn();
    const childClick = vi.fn();

    const Child: FC = () => {
      return (
        <div id='child' click={childClick}>
          <Fragment>child</Fragment>
        </div>
      );
    };

    const Parent: FC = () => {
      return (
        <Fragment>
          <div id='parent' click={parentClick}>
            <div>parent</div>
            <Child />
          </div>
        </Fragment>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    await render(document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });

    document.getElementById('child')!.click();
    expect(childClick.mock.calls.length).toBe(1);
    expect(parentClick.mock.calls.length).toBe(1);

    document.getElementById('parent')!.click();
    expect(childClick.mock.calls.length).toBe(1);
    expect(parentClick.mock.calls.length).toBe(2);
  });
  it('subscribe', async () => {
    const parentAtom = atom(0);
    const childAtom = atom(0);

    const Child: FC<{childAtom: Atom<number>}> = (props) => {
      return (
        <div data-name={props.childAtom} id='child'>
          <Fragment>child</Fragment>
        </div>
      );
    };

    const Parent: FC = () => {
      return (
        <Fragment>
          <div data-name={parentAtom} id='parent'>
            <div>parent</div>
            <Child childAtom={childAtom} />
          </div>
        </Fragment>
      );
    };

    const jsdom = new JSDOM();
    const document = jsdom.window.document;

    await render(document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });

    const childDiv = document.getElementById('child')!;
    const parentDiv = document.getElementById('parent')!;

    expect(childDiv.getAttribute('data-name')).toBe('0');

    await childAtom.set(0);

    expect(childDiv.getAttribute('data-name')).toBe('0');

    expect(parentDiv.getAttribute('data-name')).toBe('0');
  });
  it.only('jsxPath', async () => {
    let level3JsxPath!: string;
    const Level3: FC = (_, ctx) => {
      level3JsxPath = ctx.getJsxPath();
      return <div>level3</div>;
    };
    const Level2 = () => {
      // 0
      return <Level3 />;
    };
    const level1Atom = atom(<Level2 />);
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

    await render(jsdom.window.document.body, <Level0 />, {
      window: jsdom.window as any as Window,
    });

    console.log('-----', 'level3JsxPath', level3JsxPath);
    expect(/0\.1\.0\.0\.2\?a=\d+\.0\.0\.0/.test(level3JsxPath)).toBe(true);
  });
});
