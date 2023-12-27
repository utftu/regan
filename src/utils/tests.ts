import {hydrateRaw} from '../hydrate/hydrate.ts';
import {JSXNode} from '../node/node.ts';
import {getString} from '../string/string.ts';
import {JSDOM} from 'jsdom';

export async function insertAndHydrate({
  jsdom,
  jsxNode,
}: {
  jsdom: JSDOM;
  jsxNode: JSXNode;
}) {
  const root = jsdom.window.document.createElement('div');
  root.setAttribute('id', 'root');
  jsdom.window.document.body.appendChild(root);

  const str = await getString(jsxNode);
  root.innerHTML = str;

  await hydrateRaw({
    node: jsxNode,
    getElementPointer: () => ({
      parent: root,
    }),
    window: jsdom.window as any as Window,
  });

  return root;
}
