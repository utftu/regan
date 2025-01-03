import {HNodeElement} from '../../../element.ts';
import {HNode} from '../../../h-node.ts';
import {HNodeText} from '../../../text.ts';
import {findNextHNode, findPrevHNode} from '../find.ts';

export const findPrevTextHNode = (hNode: HNode) => {
  return findPrevHNode(hNode, (hNode) => {
    if (hNode instanceof HNodeElement) {
      return 'stop';
    }

    if (hNode instanceof HNodeText) {
      return hNode;
    }
  });
};

export const findNextTextHNode = (hNode: HNode) => {
  return findNextHNode(hNode, (hNode) => {
    if (hNode instanceof HNodeElement) {
      return 'stop';
    }

    if (hNode instanceof HNodeText) {
      return hNode;
    }
  });
};

export const findNextTextHNodes = (hNode: HNode) => {
  const nodes = [];
  let nextNode = findNextTextHNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findNextTextHNode(nextNode);
  }
  return nodes;
};
