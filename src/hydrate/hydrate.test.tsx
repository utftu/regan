import {describe, expect, it, vi} from 'vitest';
import {JSXNode} from '../node/node.ts';
import {JSDOM} from 'jsdom';
import {Fragment} from '../components/fragment/fragment.ts';
import {FC} from '../types.ts';
import {createAtomRegan} from '../atoms/atoms.ts';
import {atom} from 'strangelove';
import {waitTime} from 'utftu';
import {insertAndHydrate} from '../utils/tests.ts';

// async function insertAndHydrate(
//   body: HTMLElement,
//   jsxNode: JSXNode,
//   jsdom: JSDOM
// ) {
//   const root = document.createElement('div');
//   root.setAttribute('id', 'root');
//   body.appendChild(root);

//   const str = await getString(jsxNode);
//   root.innerHTML = str;

//   await hydrate(root, jsxNode, {
//     window: jsdom.window as any,
//   });

//   return root;
// }

describe('hydrate', () => {
  describe('child', () => {
    it('child element', async () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <div id='div' click={onClick}>
            component
          </div>
        );
      };

      const jsdom = new JSDOM();

      await insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component', async () => {
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

      await insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('child')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('child component with fragment', async () => {
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

      await insertAndHydrate({jsdom, jsxNode: <Parent />});

      const div = jsdom.window.document.getElementById('div')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
  });
  describe('fragment', () => {
    it('fragment signle', async () => {
      const onClick = vi.fn();
      const Component = () => {
        return (
          <Fragment>
            <div id='div1'>div1</div>
            <Fragment>
              <div id='div2' click={onClick}>
                div2
              </div>
            </Fragment>
            <div id='div3'>div3</div>
          </Fragment>
        );
      };

      const jsdom = new JSDOM();

      await insertAndHydrate({jsdom, jsxNode: <Component />});

      const div = jsdom.window.document.getElementById('div2')!;
      div.click();
      expect(onClick.mock.calls.length).toBe(1);
      div.click();
      expect(onClick.mock.calls.length).toBe(2);
    });
    it('fragment many', async () => {
      const onClickDiv3 = vi.fn();
      const onClickDiv4 = vi.fn();
      const Component = () => {
        return (
          <Fragment>
            <div id='div1'>div1</div>
            <Fragment>
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

      await insertAndHydrate({jsdom, jsxNode: <Component />});

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
    it('mount order', async () => {
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

      await insertAndHydrate({jsdom, jsxNode: <Parent />});

      expect(mounts[0]).toBe('parent');
      expect(mounts[1]).toBe('child1');
      expect(mounts[2]).toBe('child2');
    });
  });
  it('child atoms', async () => {
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
          {createAtomRegan(<Child />)}
        </div>
      );
    };

    const jsdom = new JSDOM();

    await insertAndHydrate({jsdom, jsxNode: <Parent />});

    const div = jsdom.window.document.getElementById('child')!;
    div.click();
    expect(onClickChild.mock.calls.length).toBe(1);
    div.click();
    expect(onClickChild.mock.calls.length).toBe(2);

    const parentElem = jsdom.window.document.getElementById('parent')!;
    parentElem.click();
    expect(onClickElement.mock.calls.length).toBe(1);
  });
  it('jsxPath', async () => {
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

    await insertAndHydrate({jsdom, jsxNode: <Level0 />});
    expect(level3JsxPath).toBe('0.1.0.0.2?a=0.0.0.0');
  });
  it('async child', async () => {
    const childClick = vi.fn();
    const Child = async () => {
      await waitTime(30);

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

    await insertAndHydrate({jsdom, jsxNode: <Parent />});
    jsdom.window.document.getElementById('child')!.click();

    expect(childClick.mock.calls.length).toBe(1);
  });
  // it('atoms changed', async () => {
  //   const childClick = vi.fn();
  //   const atom1 = createAtomRegan()
  //   const Child = async () => {
  //     await waitTime(30);

  //     return (
  //       <div id='child' click={childClick}>
  //         child
  //       </div>
  //     );
  //   };

  //   const Parent = () => {
  //     return (
  //       <div>
  //         <Child />
  //       </div>
  //     );
  //   };

  //   const jsdom = new JSDOM();

  //   await insertAndHydrate(jsdom.window.document.body, <Parent />);
  //   jsdom.window.document.getElementById('child')!.click();

  //   expect(childClick.mock.calls.length).toBe(1);
  // });
});
