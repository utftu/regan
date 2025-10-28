import {HNodeElement} from '../../h-node/element.ts';
import {findPrevDomNodeHNode} from '../../h-node/find/dom-node/dom-node.ts';
import {getTopHNodeElement} from '../../h-node/find/element/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {DomPointer} from '../../types.ts';
import {checkClassChild} from '../../utils/check-parent.ts';

export const getDomPointer = (hNode: HNode): DomPointer => {
  const {domNode, lastParentHNode} = findPrevDomNodeHNode(hNode);

  if (domNode && domNode.parentNode) {
    return {
      parent: domNode.parentNode,
      nodeCount: Array.prototype.indexOf.call(
        domNode.parentNode.childNodes,
        domNode
      ),
    };
  } else if (checkClassChild(lastParentHNode, 'hNodeElement')) {
    return {
      parent: lastParentHNode.element,
      nodeCount: 0,
    };
  } else {
    const findedNearestHNodeElement = getTopHNodeElement(
      lastParentHNode || hNode
    );
    if (findedNearestHNodeElement) {
      return {
        parent: findedNearestHNodeElement.element,
        nodeCount: 0,
      };
    } else {
      return {
        parent: hNode.globalCtx.clientCtx.initDomPointer.parent,
        nodeCount: hNode.globalCtx.clientCtx.initDomPointer.nodeCount,
      };
    }
  }
};
