import {JSDOM} from 'jsdom';
import {createAtom} from 'strangelove';
import {render, h} from '../dist/regan.js';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = jsdom.window;
globalThis.document = jsdom.window.document;

const N = Number(process.argv[2] ?? 1000);
const KEYED = process.argv[3] !== 'nokey';

let runs = 0;
const Row = ({item}) => {
  runs++;
  return h('div', {class: 'row'}, h('span', {}, item.label));
};

const make = (items) =>
  items.map((item) =>
    h(Row, KEYED ? {key: String(item.id), item} : {item}, []),
  );

const items = [];
for (let i = 0; i < N; i++) items.push({id: i, label: `строка ${i}`});

const list = createAtom(make(items));
const App = () => h('div', {id: 'holder'}, list);

const container = document.createElement('div');
document.body.append(container);
render(container, h(App, {}, []), {window: jsdom.window});

const flush = () => new Promise((resolve) => queueMicrotask(resolve));
await flush();

const mountRuns = runs;
runs = 0;

const measure = async (name, fn) => {
  const start = performance.now();
  fn();
  await flush();
  const time = performance.now() - start;
  console.log(
    `${name.padEnd(22)} ${time.toFixed(2).padStart(7)} мс   запусков компонента: ${runs}`,
  );
  runs = 0;
};

console.log(
  `N=${N}, ключи: ${KEYED ? 'да' : 'нет'}, монтирование: ${mountRuns} запусков`,
);

await measure('вставка в начало', () => {
  items.unshift({id: -1, label: 'новая'});
  list.set(make(items));
});

await measure('удаление из середины', () => {
  items.splice(Math.floor(items.length / 2), 1);
  list.set(make(items));
});

await measure('перестановка (reverse)', () => {
  items.reverse();
  list.set(make(items));
});

console.log('строк в dom:', container.querySelectorAll('.row').length);
