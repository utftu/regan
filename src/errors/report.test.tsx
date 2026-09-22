import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {waitTime} from 'utftu';
import {ErrorGuard} from '../components/error-guard.tsx';
import {render} from '../render/render.ts';
import {FC} from '../types.ts';
import {checkErrorRegan} from './errors.ts';

const catchReported = async (run: () => void) => {
  const reported: unknown[] = [];
  const original = globalThis.reportError;
  globalThis.reportError = (error: unknown) => {
    reported.push(error);
  };

  try {
    run();
    await waitTime(0);
  } finally {
    globalThis.reportError = original;
  }

  return reported;
};

const mount = (jsxNode: any) => {
  const jsdom = new JSDOM();
  render(jsdom.window.document.body, jsxNode, {
    window: jsdom.window as any as Window,
  });

  return jsdom;
};

describe('непойманная ошибка', () => {
  it('ошибка в слушателе уходит в reportError', async () => {
    let jsdom: JSDOM | undefined;

    const reported = await catchReported(() => {
      const Component: FC = () => (
        <button
          id='button'
          click={() => {
            throw new Error('бум');
          }}
        >
          x
        </button>
      );

      jsdom = mount(<Component />);
      jsdom.window.document.getElementById('button')!.click();
    });

    expect(reported).toHaveLength(1);
    expect((reported[0] as Error).message).toBe('бум');
  });

  it('ошибка в mount на первом рендере летит из render наружу', () => {
    const Component: FC = (_props, ctx) => {
      ctx.mount(() => {
        throw new Error('бум');
      });

      return <div />;
    };

    // mount зовётся из render, а не через handleError: прятать нечего,
    // ошибка просто не даёт странице подняться
    expect(() => mount(<Component />)).toThrow('бум');
  });

  it('перехваченная ошибка в reportError не уходит', async () => {
    const reported = await catchReported(() => {
      const Component: FC = () => (
        <button
          id='button'
          click={() => {
            throw new Error('бум');
          }}
        >
          x
        </button>
      );

      const jsdom = mount(
        <ErrorGuard handler={() => undefined}>
          <Component />
        </ErrorGuard>,
      );
      jsdom.window.document.getElementById('button')!.click();
    });

    expect(reported).toHaveLength(0);
  });

  it('в ошибке лежит путь до узла', async () => {
    const reported = await catchReported(() => {
      const Button: FC = () => (
        <button
          id='button'
          click={() => {
            throw new Error('бум');
          }}
        >
          x
        </button>
      );

      function App() {
        return (
          <div>
            <span>раз</span>
            <Button />
          </div>
        );
      }

      const jsdom = mount(<App />);
      jsdom.window.document.getElementById('button')!.click();
    });

    const error = reported[0];

    expect(checkErrorRegan(error)).toBe(true);
    expect(checkErrorRegan(error) && error.path).toBe(
      '<App><div><Button:1><button>',
    );
  });
});
