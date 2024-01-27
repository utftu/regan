import {hydrate} from '../hydrate/hydrate.ts';
import {JsxNode} from '../node/node.ts';
import {getString} from '../string/string.ts';
import {JSDOM} from 'jsdom';

export async function insertAndHydrate({
  jsdom,
  jsxNode,
}: {
  jsdom: JSDOM;
  jsxNode: JsxNode;
}) {
  const root = jsdom.window.document.createElement('div');
  root.setAttribute('id', 'root');
  jsdom.window.document.body.appendChild(root);

  const str = await getString(jsxNode);
  root.innerHTML = str;

  await hydrate(root, jsxNode, {window: jsdom.window as any});

  return root;
}
