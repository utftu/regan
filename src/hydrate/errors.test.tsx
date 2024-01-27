import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../utils/tests.ts';
import {ErrorGuard} from '../errors/errors.tsx';

describe('hydrate errors', () => {
  it('default click handler', async () => {
    const Component = () => {
      return (
        <div
          click={() => {
            throw new Error('my error');
          }}
          id='div'
        >
          component
        </div>
      );
    };

    const jsdom = new JSDOM();
    const root = await insertAndHydrate({jsdom, jsxNode: <Component />});

    jsdom.window.document.getElementById('div')!.click();

    expect(root.innerHTML).toBe('<div id="div">component</div>');
  });
  it('default jsx handler', async () => {
    const parentChild = vi.fn();
    const Child = () => {
      return (
        <div
          id='child'
          click={() => {
            throw new Error('child');
          }}
        ></div>
      );
    };

    const Parent = () => {
      return (
        <div id='parent' click={parentChild}>
          parent
          <Child />
        </div>
      );
    };

    const jsdom = new JSDOM();
    await insertAndHydrate({jsdom, jsxNode: <Parent />});
    jsdom.window.document.getElementById('parent')!.click();

    expect(parentChild.mock.calls.length).toBe(1);
  });
  it('deep', async () => {
    const parentChild = vi.fn();
    const ChildJsxError = () => {
      throw new Error('jsx error');
    };
    const ChildHandlerError = () => {
      return (
        <div
          id='child'
          click={() => {
            throw new Error('child');
          }}
        >
          handler
        </div>
      );
    };

    const Parent = () => {
      return (
        <ErrorGuard>
          <div id='parent' click={parentChild}>
            parent
            <ChildJsxError />
            <ChildHandlerError />
          </div>
        </ErrorGuard>
      );
    };

    const jsdom = new JSDOM();
    await insertAndHydrate({jsdom, jsxNode: <Parent />});
    jsdom.window.document.getElementById('parent')!.click();

    // expect(parentChild.mock.calls.length).toBe(1);
  });
});
