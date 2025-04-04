import {hydrate} from '../hydrate/hydrate.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {stringify} from '../stringify/stringify.ts';
import {JSDOM} from 'jsdom';

export function insertAndHydrate({
  jsdom,
  jsxNode,
}: {
  jsdom: JSDOM;
  jsxNode: JsxNode;
}) {
  const root = jsdom.window.document.createElement('div');
  root.setAttribute('id', 'root');
  jsdom.window.document.body.appendChild(root);

  const str = stringify(jsxNode);
  root.innerHTML = str;

  hydrate(root, jsxNode, {window: jsdom.window as any});

  return root;
}
