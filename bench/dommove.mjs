import {JSDOM} from 'jsdom';
const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {document} = jsdom.window;
const N = 1000;
const parent = document.createElement('div');
document.body.append(parent);
const nodes = [];
for (let i = 0; i < N; i++) {
  const el = document.createElement('div');
  el.textContent = String(i);
  parent.append(el);
  nodes.push(el);
}
// разворот: каждый узел переставляем после предыдущего
const start = performance.now();
let prev = null;
for (let i = N - 1; i >= 0; i--) {
  const node = nodes[i];
  if (prev) prev.after(node);
  else parent.prepend(node);
  prev = node;
}
console.log(
  'голый jsdom, разворот 1000 узлов:',
  (performance.now() - start).toFixed(2),
  'мс',
);
console.log(
  'порядок:',
  parent.firstChild.textContent,
  '...',
  parent.lastChild.textContent,
);
