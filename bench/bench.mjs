import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {render as reganRender, h} from '../dist/regan.js';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = jsdom.window;
globalThis.document = jsdom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: jsdom.window.navigator,
  configurable: true,
});
globalThis.HTMLElement = jsdom.window.HTMLElement;
globalThis.Node = jsdom.window.Node;
globalThis.Element = jsdom.window.Element;
globalThis.IS_REACT_ACT_ENVIRONMENT = false;

const React = (await import('react')).default;
const {createRoot} = await import('react-dom/client');
const {flushSync} = await import('react-dom');
const {createSignal} = await import('solid-js');
const {render: solidRender} = await import('solid-js/web');
const {makeApp: makeSolidApp} = await import('./solid-app.mjs');

const N = Number(process.argv[2] ?? 1000);

const makeContainer = () => {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 0));
const flush = () => new Promise((resolve) => queueMicrotask(resolve));

// ——— regan ———
const regan = {
  name: 'regan',
  mount(container) {
    const atoms = Array.from({length: N}, (_, i) => createAtom(`строка ${i}`));

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

    reganRender(container, h(App, {}, []), {window: jsdom.window});
    return atoms;
  },
  async updateAll(atoms, text) {
    atoms.forEach((atom, i) => atom.set(`${text} ${i}`));
    await flush();
  },
  async updateOne(atoms, text) {
    atoms[0].set(text);
    await flush();
  },
};

// ——— react ———
const Row = React.memo(({value}) =>
  React.createElement(
    'div',
    {className: 'row'},
    React.createElement('span', {className: 'cell'}, value),
    React.createElement('span', {className: 'cell'}, 'хвост'),
  ),
);

const react = {
  name: 'react',
  mount(container) {
    let setRows;
    const App = () => {
      const [rows, set] = React.useState(() =>
        Array.from({length: N}, (_, i) => `строка ${i}`),
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
    flushSync(() => handle()((rows) => rows.map((_, i) => `${text} ${i}`)));
  },
  async updateOne(handle, text) {
    flushSync(() =>
      handle()((rows) => {
        const next = rows.slice();
        next[0] = text;
        return next;
      }),
    );
  },
};

// ——— solid ———
const solid = {
  name: 'solid',
  mount(container) {
    const {App, signals} = makeSolidApp(N);
    solidRender(() => App(), container);
    return signals;
  },
  async updateAll(signals, text) {
    signals.forEach(([, set], i) => set(`${text} ${i}`));
  },
  async updateOne(signals, text) {
    signals[0][1](text);
  },
};

const measure = async (fn, times) => {
  const start = performance.now();
  for (let i = 0; i < times; i++) {
    await fn(i);
  }
  return (performance.now() - start) / times;
};

const baseline = await measure(wait, 50);

for (const framework of [regan, react, solid]) {
  const warm = makeContainer();
  const warmHandle = framework.mount(warm);
  await framework.updateAll(warmHandle, 'прогрев');
  warm.remove();

  const mountTimes = 10;
  let handle;
  const mount = await measure(async () => {
    const container = makeContainer();
    handle = framework.mount(container);
    container.remove();
  }, mountTimes);

  const container = makeContainer();
  handle = framework.mount(container);

  const updateAll = await measure(
    (i) => framework.updateAll(handle, `все ${i}`),
    20,
  );
  const updateOne = await measure(
    (i) => framework.updateOne(handle, `один ${i}`),
    50,
  );

  container.remove();

  console.log(
    `${framework.name.padEnd(6)} | монтирование ${mount.toFixed(1).padStart(7)} мс` +
      ` | обновить все ${updateAll.toFixed(2).padStart(7)} мс` +
      ` | обновить один ${updateOne.toFixed(3).padStart(6)} мс`,
  );
}

console.log(`\nбаза setTimeout(0): ${baseline.toFixed(3)} мс`);

// контроль: обновление действительно доехало до DOM за микротаск
{
  const container = makeContainer();
  const atoms = regan.mount(container);
  atoms[0].set('проверка');
  await new Promise((resolve) => queueMicrotask(resolve));
  const text = container.querySelector('.row .cell').textContent;
  console.log(`контроль микротаска: "${text}"`);
  container.remove();
}
