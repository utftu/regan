import {describe, expect, it, vi} from 'vitest';
import {getString} from './string/string.ts';
import {FC, JSXNode} from './node.ts';
import {hydrate} from './hydrate/hydrate.ts';
import {JSDOM} from 'jsdom';

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
});
