import {HNodeElement} from '../h-node/element.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeText} from '../h-node/text.ts';
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

export const createHNode = () => {
  return new HNodeComponent({} as any);
};

export const createHNodeElement = () => {
  return new HNodeElement({} as any, {} as any);
};

export const createHNodeText = (text: string = '') => {
  return new HNodeText({} as any, {text} as any);
};
