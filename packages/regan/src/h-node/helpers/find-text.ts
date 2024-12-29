import {HNodeElement} from '../../h-node/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeText} from '../../h-node/text.ts';
import {findNextHNode, findPrevHNode} from './find.ts';

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
