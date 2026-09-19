import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';

export const logHNodes = (hNode: HNode) => {
  console.log(logHNodesInner(hNode, 0));
};

export const logHNodesInner = (hNode: HNode, indent = 0): string => {
  const pad = '  '.repeat(indent);

  let typeInfo = '';

  if (hNode instanceof HNodeElement) {
    typeInfo = `"element": "${hNode.element.tagName}"`;
  } else if (hNode instanceof HNodeComponent) {
    typeInfo = `"component": ""`;
  } else if (hNode instanceof HNodeText) {
    typeInfo = `"text": ${JSON.stringify(hNode.text)}`;
  }

  const children = hNode.children
    .map((child) => logHNodesInner(child, indent + 1))
    .join(',\n');

  return `${pad}{
${pad}  ${typeInfo},
${pad}  "children": [
${children}
${pad}  ]
${pad}}`;
};
