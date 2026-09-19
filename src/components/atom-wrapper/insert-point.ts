import {findPrevDomNodeHNode} from '../../h-node/find/dom-node/dom-node.ts';
import {getTopHNodeElement} from '../../h-node/find/element/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {InsertPoint} from '../../types.ts';
import {checkClassChild} from '../../utils/check-parent.ts';

export const getInsertPoint = (hNode: HNode): InsertPoint => {
  const {domNode, lastParentHNode} = findPrevDomNodeHNode(hNode);

  if (domNode && domNode.parentNode) {
    return {
      parent: domNode.parentNode,
      prevNode: domNode,
    };
  }

  if (checkClassChild(lastParentHNode, 'hNodeElement')) {
    return {
      parent: lastParentHNode.element,
    };
  }

  const findedNearestHNodeElement = getTopHNodeElement(
    lastParentHNode || hNode,
  );

  if (findedNearestHNodeElement) {
    return {
      parent: findedNearestHNodeElement.element,
    };
  }

  return hNode.globalCtx.clientCtx.initInsertPoint;
};
