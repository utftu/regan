import {describe, expect, it, vi} from 'vitest';
import {JSDOM} from 'jsdom';
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
