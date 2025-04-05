import {HNodeElement} from '../../element.ts';
import {HNode} from '../../h-node.ts';

export const getTopHNodeElement = (hNode: HNode): HNodeElement | void => {
  if (hNode instanceof HNodeElement) {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return getTopHNodeElement(hNode.parent);
};
