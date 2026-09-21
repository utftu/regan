import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {waitTime} from 'utftu';
import {render} from '../render/render.ts';
import {ErrorLogger} from './logger.tsx';
import {FC} from '../types.ts';

const withConsole = async (run: () => any) => {
  const group = console.group;
  const groupCollapsed = console.groupCollapsed;
  const groupEnd = console.groupEnd;
  const log = console.log;
  const dir = console.dir;

  const titles: string[] = [];
  console.group = (title?: any) => titles.push(String(title));
  console.groupCollapsed = (title?: any) => titles.push(String(title));
  console.groupEnd = () => {};
  console.log = () => {};
  console.dir = () => {};

  try {
    await run();
  } finally {
    console.group = group;
    console.groupCollapsed = groupCollapsed;
    console.groupEnd = groupEnd;
    console.log = log;
    console.dir = dir;
  }

  return titles;
};

const Boom: FC = () => {
  throw new Error('бум');
};

describe('ErrorLogger', () => {
  it('печатает ошибку и пробрасывает её дальше', async () => {
    const titles = await withConsole(() => {
      const jsdom = new JSDOM();
      const root = jsdom.window.document.createElement('div');
      jsdom.window.document.body.append(root);

      expect(() =>
        render(
          root,
          <ErrorLogger>
            <Boom />
          </ErrorLogger>,
          {window: jsdom.window as any},
        ),
      ).toThrow('бум');
    });

    expect(titles.some((title) => title.includes('regan: error: бум'))).toBe(
      true,
    );
  });

  it('enabled={false} ничего не логирует и не мешает', async () => {
    const titles = await withConsole(() => {
      const jsdom = new JSDOM();
      const root = jsdom.window.document.createElement('div');
      jsdom.window.document.body.append(root);

      render(
        root,
        <ErrorLogger enabled={false}>
          <div id='ok'>ok</div>
        </ErrorLogger>,
        {window: jsdom.window as any},
      );

      expect(root.querySelector('#ok')!.textContent).toBe('ok');
    });

    expect(titles).toEqual([]);
  });

  it('печатает падение при обновлении динамической области', async () => {
    const value = createAtom<any>('ok');
    const reported: unknown[] = [];
    const originalReport = globalThis.reportError;
    globalThis.reportError = (error: unknown) => reported.push(error);

    const titles = await withConsole(async () => {
      const jsdom = new JSDOM();
      const root = jsdom.window.document.createElement('div');
      jsdom.window.document.body.append(root);

      render(root, <ErrorLogger>{value}</ErrorLogger>, {
        window: jsdom.window as any,
      });

      value.set(<Boom />);
      await waitTime(0);
    });

    globalThis.reportError = originalReport;

    expect(titles.some((title) => title.includes('regan: error: бум'))).toBe(
      true,
    );
    // логгер печатает и бросает заново, так что перехватить всё равно некому
    expect(reported).toHaveLength(1);
  });
});
