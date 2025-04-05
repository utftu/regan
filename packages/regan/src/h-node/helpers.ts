import {HNode} from './h-node.ts';

export const mountHNodes = (hNode: HNode) => {
  hNode.mount();
  hNode.children.forEach((hNode) => mountHNodes(hNode));
};

export const unmountHNodes = (hNode: HNode) => {
  hNode.unmount();
  hNode.children.forEach((hNode) => unmountHNodes(hNode));
};

export const detachChildren = (hNode: HNode) => {
  hNode.children.forEach((hNodeChild) => {
    unmountHNodes(hNodeChild);
    hNodeChild.parent = undefined;
  });
  hNode.children.length = 0;
};
