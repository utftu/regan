import {HNode} from './h-node.ts';

export const mountHNodes = (hNode: HNode) => {
  hNode.mount();
  hNode.children.forEach((hNode) => mountHNodes(hNode));
};
