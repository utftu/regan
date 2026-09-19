import {describe, expect, it, vi} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {FC} from '../types.ts';
import {ErrorGuard} from './error-guard.tsx';
import {render} from '../render/render.ts';
import {stringify} from '../stringify/stringify.ts';

describe('ErrorGuard', () => {
  it('renders children when no error', () => {
    const Component: FC = () => {
      return <div id="child">content</div>;
    };

    const jsdom = new JSDOM();

    render(
      jsdom.window.document.body,
      <ErrorGuard handler={() => <div>error</div>}>
        <Component />
      </ErrorGuard>,
      {window: jsdom.window as any as Window}
    );

    expect(jsdom.window.document.getElementById('child')).not.toBe(null);
  });

  it('renders handler result on error', () => {
    const ThrowingComponent: FC = () => {
      throw new Error('test error');
    };

    const jsdom = new JSDOM();

    render(
      jsdom.window.document.body,
      <ErrorGuard handler={() => <div id="fallback">error occurred</div>}>
        <ThrowingComponent />
      </ErrorGuard>,
      {window: jsdom.window as any as Window}
    );

    expect(jsdom.window.document.getElementById('fallback')).not.toBe(null);
  });

  it('handler receives error props', () => {
    const handler = vi.fn(() => <div>error</div>);

    const ThrowingComponent: FC = () => {
      throw new Error('test error');
    };

    const jsdom = new JSDOM();

    render(
      jsdom.window.document.body,
      <ErrorGuard handler={handler}>
        <ThrowingComponent />
      </ErrorGuard>,
      {window: jsdom.window as any as Window}
    );

    expect(handler).toHaveBeenCalled();
    expect((handler.mock.calls as any)[0]?.[0]).toHaveProperty('error');
  });

  it('works with stringify', () => {
    const ThrowingComponent: FC = () => {
      throw new Error('test error');
    };

    const html = stringify(
      <ErrorGuard handler={() => <div id="fallback">error</div>}>
        <ThrowingComponent />
      </ErrorGuard>
    );

    expect(html).toContain('fallback');
  });

  it('nested ErrorGuard catches inner errors', () => {
    const ThrowingComponent: FC = () => {
      throw new Error('inner error');
    };

    const jsdom = new JSDOM();

    render(
      jsdom.window.document.body,
      <ErrorGuard handler={() => <div id="outer">outer error</div>}>
        <div>
          <ErrorGuard handler={() => <div id="inner">inner error</div>}>
            <ThrowingComponent />
          </ErrorGuard>
        </div>
      </ErrorGuard>,
      {window: jsdom.window as any as Window}
    );

    expect(jsdom.window.document.getElementById('inner')).not.toBe(null);
    expect(jsdom.window.document.getElementById('outer')).toBe(null);
  });
});

const setupUpdate = (jsxNode: any) => {
  const jsdom = new JSDOM();
  const root = jsdom.window.document.createElement('div');
  jsdom.window.document.body.append(root);

  render(root, jsxNode, {window: jsdom.window as any});

  return root;
};

const Boom: FC = () => {
  throw new Error('бум');
};

describe('ErrorGuard на обновлении динамической области', () => {
  it('ловит падение компонента, отрендеренного из атома', async () => {
    const value = createAtom<any>(<span id='ok'>ok</span>);

    const holder = setupUpdate(
      <div id='holder'>
        <ErrorGuard handler={() => <span id='caught'>поймали</span>}>
          {value}
        </ErrorGuard>
      </div>
    ).querySelector('#holder')!;

    expect(holder.textContent).toBe('ok');

    value.set(<Boom />);
    await waitTime(0);

    expect(holder.querySelector('#caught')).not.toBe(null);
    expect(holder.textContent).toBe('поймали');
  });

  it('в обработчик приходит сама ошибка', async () => {
    const value = createAtom<any>('ok');
    let message = '';

    const holder = setupUpdate(
      <div id='holder'>
        <ErrorGuard
          handler={({error}) => {
            message = error.message;
            return <span>поймали</span>;
          }}
        >
          {value}
        </ErrorGuard>
      </div>
    ).querySelector('#holder')!;

    value.set(<Boom />);
    await waitTime(0);

    expect(message).toBe('бум');
    expect(holder.textContent).toBe('поймали');
  });

  it('падение внутреннего guard не выносит внешний', async () => {
    const value = createAtom<any>('ok');

    const holder = setupUpdate(
      <div id='holder'>
        <ErrorGuard handler={() => <span id='outer'>внешний</span>}>
          <ErrorGuard handler={() => <Boom />}>{value}</ErrorGuard>
        </ErrorGuard>
      </div>
    ).querySelector('#holder')!;

    value.set(<Boom />);
    await waitTime(0);
    await waitTime(0);

    expect(holder.querySelector('#outer')).not.toBe(null);
  });

  it('без guard ошибка уходит наружу, но реактивность жива', async () => {
    const value = createAtom<any>(<span id='ok'>ok</span>);
    const other = createAtom('раз');

    const reported: unknown[] = [];
    const original = globalThis.reportError;
    globalThis.reportError = (error: unknown) => {
      reported.push(error);
    };

    try {
      const holder = setupUpdate(
        <div id='holder'>
          {value}
          <span id='other'>{other}</span>
        </div>
      ).querySelector('#holder')!;

      value.set(<Boom />);
      await waitTime(0);

      // перехватить некому: дерево на месте, ошибка не проглочена
      expect(holder.querySelector('#ok')).not.toBe(null);
      expect(reported).toHaveLength(1);
      expect((reported[0] as Error).message).toBe('бум');

      // и апдейтер не встал: следующее обновление проходит
      other.set('два');
      await waitTime(0);

      expect(holder.querySelector('#other')!.textContent).toBe('два');
    } finally {
      globalThis.reportError = original;
    }
  });

  it('падающий обработчик без guard выше не зацикливается', async () => {
    const value = createAtom<any>('ok');

    const reported: unknown[] = [];
    const original = globalThis.reportError;
    globalThis.reportError = (error: unknown) => {
      reported.push(error);
    };

    try {
      setupUpdate(
        <div id='holder'>
          <ErrorGuard handler={() => <Boom />}>{value}</ErrorGuard>
        </div>
      );

      value.set(<Boom />);

      // каждая попытка уходит на guard выше; выше никого — цепочка кончается
      await waitTime(0);
      await waitTime(0);
      await waitTime(0);

      expect(reported).toHaveLength(1);
    } finally {
      globalThis.reportError = original;
    }
  });
});
