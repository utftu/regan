import {Atom} from 'strangelove';
import {HNode} from '../../h-node/h-node.ts';
import {DomPointer} from '../../types.ts';
import {checkNamedAtom} from '../../atoms/atoms.ts';
import {
  findPrevDomNodeHNode,
  getNearestHNodeElement,
} from '../../h-node/utils/find/node/node.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {AtomWrapperData} from '../../h-node/component.ts';

export const getInsertDomPointer = (hNode: HNode): DomPointer => {
  const {prevNode, lastParentHNode} = findPrevDomNodeHNode(hNode);

  if (prevNode && prevNode.parentNode) {
    return {
      parent: prevNode.parentNode,
      nodeCount: Array.prototype.indexOf.call(
        prevNode.parentNode.childNodes,
        prevNode
      ),
    };
  } else if (lastParentHNode instanceof HNodeElement) {
    return {
      parent: lastParentHNode.element,
      nodeCount: 0,
    };
  } else {
    const findedNearestHNodeElement = getNearestHNodeElement(lastParentHNode);
    if (findedNearestHNodeElement) {
      return {
        parent: findedNearestHNodeElement.element,
        nodeCount: 0,
      };
    } else {
      return {
        parent: hNode.glocalClientCtx.initDomPointer.parent,
        nodeCount: hNode.glocalClientCtx.initDomPointer.nodeCount,
      };
    }
  }
};

export const parseAtom = (atom: Atom, renderMode: boolean = false) => {
  let additionalPart = '?a=';
  let value;
  if (checkNamedAtom(atom)) {
    const {name, value: localValue} = atom.get();
    value = localValue;
    additionalPart += name;
  } else {
    value = atom.get();

    if (renderMode) {
      additionalPart += Date.now();
    } else {
      additionalPart += '0';
    }
  }

  return {value, additionalPart};
};

export const markAndDetachChild = (hNode: HNode) => {
  if (hNode instanceof AtomWrapperData) {
    hNode.willUnmount = true;

    hNode.unsibscribeWrapper?.();
  }
};

export const markAsWillUnmount = (hNodes: HNode[]) => {
  hNodes.forEach((hNode) => {
    if (hNode instanceof AtomWrapperData) {
      markAndDetachChild(hNode);
    }
    hNode.children.forEach((child) => {
      markAsWillUnmount(child.children);
    });
  });
};
