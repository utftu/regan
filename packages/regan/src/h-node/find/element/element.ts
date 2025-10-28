import {checkClassChild} from '../../../utils/check-parent.ts';
import {HNodeElement} from '../../element.ts';
import {HNode} from '../../h-node.ts';

export const getTopHNodeElement = (hNode: HNode): HNodeElement | void => {
  if (checkClassChild(hNode, 'hNodeElement')) {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return getTopHNodeElement(hNode.parent);
};
