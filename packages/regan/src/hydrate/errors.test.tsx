import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../utils/tests.ts';
import {
  ErrorGuardHandler,
  ErrorGuardJsx,
  defaultErrorJsx,
} from '../errors/errors.tsx';

describe('hydrate errors', () => {
  it('default', async () => {
    const parentChild = vi.fn();
    const ChildJsx = () => {
      throw new Error('child');
    };
    const ChildHandler = () => {
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
          <ChildJsx />
          <ChildHandler />
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
    const errorJsx = new Error('jsx error');
    const errorHandler = new Error('handler error');
    let savedJsxError;
    let savedHandlerError;

    const ChildJsxError = () => {
      throw errorJsx;
    };
    const ChildHandlerError = () => {
      return (
        <div
          id='child'
          click={() => {
            throw errorHandler;
          }}
        >
          handler
        </div>
      );
    };

    const Parent = () => {
      return (
        <ErrorGuardJsx
          errorJsx={({error}) => {
            savedJsxError = error;

            return defaultErrorJsx();
          }}
        >
          <ErrorGuardHandler
            errorHandler={({error}) => {
              savedHandlerError = error;
            }}
          >
            <div id='parent' click={parentChild}>
              parent
              <ChildJsxError />
              <ChildHandlerError />
            </div>
          </ErrorGuardHandler>
        </ErrorGuardJsx>
      );
    };

    const jsdom = new JSDOM();
    await insertAndHydrate({jsdom, jsxNode: <Parent />});

    jsdom.window.document.getElementById('parent')!.click();

    expect(parentChild.mock.calls.length).toBe(1);

    jsdom.window.document.getElementById('child')!.click();

    expect(parentChild.mock.calls.length).toBe(2);

    expect(savedJsxError).toBe(errorJsx);
    expect(savedHandlerError).toBe(errorHandler);
  });
});
