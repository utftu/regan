import {document, getCount, makeContainer} from './env.ts';

// Сколько стоит перемещение узлов в самом jsdom, без regan. Нужен, чтобы
// отделить расход фреймворка от расхода среды.
const count = getCount(1000);

const parent = makeContainer();
const nodes: Element[] = [];

for (let i = 0; i < count; i++) {
  const element = document.createElement('div');
  element.textContent = String(i);
  parent.append(element);
  nodes.push(element);
}

const start = performance.now();

let prev: Element | undefined;

for (let i = count - 1; i >= 0; i--) {
  const node = nodes[i];

  if (prev) {
    prev.after(node);
  } else {
    parent.prepend(node);
  }

  prev = node;
}

console.log(
  `голый jsdom, разворот ${count} узлов:`,
  (performance.now() - start).toFixed(2),
  'мс',
);
console.log(
  'порядок:',
  parent.firstChild!.textContent,
  '...',
  parent.lastChild!.textContent,
);
