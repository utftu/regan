import {describe, expect, it, vi} from 'vitest';
import {getString} from './string/string.ts';
import {JSXNode} from './node.ts';
import {hydrate} from './hydrate/hydrate.ts';
import {JSDOM} from 'jsdom';
import {Fragment} from '../components/fragment/fragment.ts';
import {FC} from '../types.ts';

async function insertAndHydrate(body: HTMLElement, jsxNode: JSXNode) {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  body.appendChild(root);

  const str = await getString(jsxNode);
  root.innerHTML = str;

  await hydrate(root, jsxNode);

  return root;
}

// @vitest-environment jsdom
describe('hydrate', () => {
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

    await insertAndHydrate(jsdom.window.document.body, <Component />);

    const div = jsdom.window.document.getElementById('div')!;
    div.click();
    expect(onClick.mock.calls.length).toBe(1);
    div.click();
    expect(onClick.mock.calls.length).toBe(2);
  });
  it('child component', async () => {
    const onClick = vi.fn();
    const Child = () => {
      return (
        <div id='div' click={onClick}>
          child
        </div>
      );
    };
    const Parent = () => {
      return <Child />;
    };

    const jsdom = new JSDOM();

    await insertAndHydrate(jsdom.window.document.body, <Parent />);

    const div = jsdom.window.document.getElementById('div')!;
    div.click();
    expect(onClick.mock.calls.length).toBe(1);
    div.click();
    expect(onClick.mock.calls.length).toBe(2);
  });
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

    await insertAndHydrate(jsdom.window.document.body, <Component />);

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

    await insertAndHydrate(jsdom.window.document.body, <Component />);

    const div3 = jsdom.window.document.getElementById('div3')!;
    const div4 = jsdom.window.document.getElementById('div4')!;

    div3.click();
    expect(onClickDiv3.mock.calls.length).toBe(1);
    div3.click();
    expect(onClickDiv3.mock.calls.length).toBe(2);

    div4.click();
    expect(onClickDiv4.mock.calls.length).toBe(1);
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

      await insertAndHydrate(jsdom.window.document.body, <Parent />);

      expect(mounts[0]).toBe('parent');
      expect(mounts[1]).toBe('child1');
      expect(mounts[2]).toBe('child2');
    });
  });
});