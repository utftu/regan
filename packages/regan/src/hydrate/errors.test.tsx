import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {insertAndHydrate} from '../utils/tests.ts';
import {ErrorGurard} from '../components/error-guard.tsx';

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

    expect(() => insertAndHydrate({jsdom, jsxNode: <Parent />})).toThrowError(
      'child'
    );
  });
  it('deep', async () => {
    const parentChild = vi.fn();
    const errorJsx = new Error('jsx error');
    const errorHandler = new Error('handler error');
    const errors: any[] = [];

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
        <div id='parent' click={parentChild}>
          parent
          <ErrorGurard
            handler={({error}) => {
              errors.push(error);
            }}
          >
            <ChildJsxError />
          </ErrorGurard>
          <ErrorGurard
            handler={({error}) => {
              errors.push(error);
            }}
          >
            <ChildHandlerError />
          </ErrorGurard>
        </div>
      );
    };

    const jsdom = new JSDOM();
    insertAndHydrate({jsdom, jsxNode: <Parent />});

    jsdom.window.document.getElementById('parent')!.click();

    expect(parentChild.mock.calls.length).toBe(1);
    jsdom.window.document.getElementById('child')!.click();

    expect(parentChild.mock.calls.length).toBe(2);

    // str and hydraye = 2 jsx error
    expect(errors[0]).toBe(errorJsx);
    expect(errors[1]).toBe(errorJsx);
    expect(errors[2]).toBe(errorHandler);
  });
});
