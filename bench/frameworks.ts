import {createAtom} from 'strangelove';
import {flush, jsdom} from './env.ts';

// Один и тот же список в трёх фреймворках: N строк по две ячейки,
// у каждой строки своё реактивное значение.
export type Framework<THandle = any> = {
  name: string;
  mount: (container: Element) => THandle;
  updateAll: (handle: THandle, text: string) => Promise<void>;
  updateOne: (handle: THandle, text: string) => Promise<void>;
};

export const createRegan = async (count: number): Promise<Framework> => {
  const {render, h} = await import('../dist/regan.js');

  return {
    name: 'regan',
    mount(container) {
      const atoms = Array.from({length: count}, (_, i) =>
        createAtom(`строка ${i}`),
      );

      const App = () =>
        h(
          'div',
          {id: 'root'},
          atoms.map((atom) =>
            h('div', {class: 'row'}, [
              h('span', {class: 'cell'}, [atom]),
              h('span', {class: 'cell'}, ['хвост']),
            ]),
          ),
        );

      render(container as HTMLElement, h(App, {}, []), {
        window: jsdom.window as any,
      });

      return atoms;
    },
    async updateAll(atoms, text) {
      atoms.forEach((atom: any, i: number) => atom.set(`${text} ${i}`));
      await flush();
    },
    async updateOne(atoms, text) {
      atoms[0].set(text);
      await flush();
    },
  };
};

export const createReact = async (count: number): Promise<Framework> => {
  const React = (await import('react')).default;
  const {createRoot} = await import('react-dom/client');
  const {flushSync} = await import('react-dom');

  const Row = React.memo(({value}: any) =>
    React.createElement(
      'div',
      {className: 'row'},
      React.createElement('span', {className: 'cell'}, value),
      React.createElement('span', {className: 'cell'}, 'хвост'),
    ),
  );

  return {
    name: 'react',
    mount(container) {
      let setRows: any;

      const App = () => {
        const [rows, set] = React.useState(() =>
          Array.from({length: count}, (_, i) => `строка ${i}`),
        );
        setRows = set;

        return React.createElement(
          'div',
          {id: 'root'},
          rows.map((value, i) => React.createElement(Row, {key: i, value})),
        );
      };

      const root = createRoot(container);
      flushSync(() => root.render(React.createElement(App)));

      return () => setRows;
    },
    async updateAll(handle, text) {
      flushSync(() =>
        handle()((rows: string[]) => rows.map((_, i) => `${text} ${i}`)),
      );
    },
    async updateOne(handle, text) {
      flushSync(() =>
        handle()((rows: string[]) => {
          const next = rows.slice();
          next[0] = text;

          return next;
        }),
      );
    },
  };
};

export const createSolid = async (count: number): Promise<Framework> => {
  const {render} = await import('solid-js/web');
  const {makeApp} = await import('./solid-app.mjs');

  return {
    name: 'solid',
    mount(container) {
      const {App, signals} = makeApp(count);
      render(() => App(), container as HTMLElement);

      return signals;
    },
    async updateAll(signals, text) {
      signals.forEach(([, set]: any, i: number) => set(`${text} ${i}`));
    },
    async updateOne(signals, text) {
      signals[0][1](text);
    },
  };
};
