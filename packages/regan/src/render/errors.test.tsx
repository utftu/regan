import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {render} from './render.ts';
import {ErrorGurard} from '../components/error-guard.tsx';

describe('render errors', () => {
  it('default', () => {
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

    expect(() =>
      render(jsdom.window.document.body, <Parent />, {
        window: jsdom.window as any as Window,
      })
    ).toThrowError('child');
  });
  it('deep', () => {
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
        <ErrorGurard
          handler={({error}) => {
            errors.push(error);

            return null;
          }}
        >
          <div id='parent' click={parentChild}>
            parent
            <ErrorGurard
              handler={({error}) => {
                errors.push(error);

                return null;
              }}
            >
              <ChildJsxError />
            </ErrorGurard>
            <ErrorGurard
              handler={({error}) => {
                errors.push(error);

                return null;
              }}
            >
              <ChildHandlerError />
            </ErrorGurard>
          </div>
        </ErrorGurard>
      );
    };

    const jsdom = new JSDOM();
    render(jsdom.window.document.body, <Parent />, {
      window: jsdom.window as any as Window,
    });
    jsdom.window.document.getElementById('parent')!.click();

    expect(parentChild.mock.calls.length).toBe(1);

    jsdom.window.document.getElementById('child')!.click();

    expect(parentChild.mock.calls.length).toBe(2);

    expect(errors[0].message).toBe(errorJsx.message);
    expect(errors[1].message).toBe(errorHandler.message);
  });
});
