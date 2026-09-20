import {
  findPrevDomNode,
  getTopHNodeElement,
} from '../../h-node/find.ts';
import {HNode} from '../../h-node/h-node.ts';
import {InsertPoint} from '../../types.ts';

export const getInsertPoint = (hNode: HNode): InsertPoint => {
  const {domNode, lastParentHNode} = findPrevDomNode(hNode);

  if (domNode && domNode.parentNode) {
    return {
      parent: domNode.parentNode,
      prevNode: domNode,
    };
  }

  if (lastParentHNode?.type === 'element') {
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
