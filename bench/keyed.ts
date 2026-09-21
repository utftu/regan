import {createAtom} from 'strangelove';
import {flush, getCount, jsdom, makeContainer} from './env.ts';
import {h, render} from '../dist/regan.js';

// Что дают ключи на операциях со списком. Кроме времени считаем, сколько раз
// выполнилось тело компонента — это и есть главный эффект.
const count = getCount(1000);
const keyed = process.argv[3] !== 'nokey';

let runs = 0;

const Row = ({item}: any) => {
  runs++;

  return h('div', {class: 'row'}, [h('span', {}, [item.label])]);
};

type Item = {id: number; label: string};

const items: Item[] = Array.from({length: count}, (_, i) => ({
  id: i,
  label: `строка ${i}`,
}));

const makeRows = () =>
  items.map((item) =>
    h(Row, keyed ? {key: String(item.id), item} : {item}, []),
  );

const list = createAtom<any>(makeRows());
const App = () => h('div', {id: 'holder'}, list);

const container = makeContainer();
render(container, h(App, {}, []), {window: jsdom.window as any});
await flush();

console.log(
  `N=${count}, ключи: ${keyed ? 'да' : 'нет'}, монтирование: ${runs} запусков`,
);
runs = 0;

const measureStep = async (name: string, change: () => void) => {
  const start = performance.now();
  change();
  list.set(makeRows());
  await flush();
  const time = performance.now() - start;

  console.log(
    `${name.padEnd(22)} ${time.toFixed(2).padStart(7)} мс   запусков компонента: ${runs}`,
  );
  runs = 0;
};

await measureStep('вставка в начало', () => {
  items.unshift({id: -1, label: 'новая'});
});

await measureStep('удаление из середины', () => {
  items.splice(Math.floor(items.length / 2), 1);
});

await measureStep('перестановка (reverse)', () => {
  items.reverse();
});

console.log('строк в dom:', container.querySelectorAll('.row').length);
