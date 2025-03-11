import {HNodeElement} from '../../../element.ts';
import {HNode} from '../../../h-node.ts';
import {HNodeText} from '../../../text.ts';
import {findPrevHNode, ReturnConfig} from '../find.ts';

export const getNearestHNodeElement = (hNode: HNode): HNodeElement | void => {
  if (hNode instanceof HNodeElement) {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return getNearestHNodeElement(hNode.parent);
};

export const findPrevDomNodeHNode = (hNode: HNode) => {
  const config: ReturnConfig = {};
  let result = findPrevHNode(
    hNode,
    (hNode) => {
      if (hNode instanceof HNodeElement) {
        return hNode;
      }

      if (hNode instanceof HNodeText) {
        return hNode;
      }
    },
    config
  );

  let node;

  if (result instanceof HNodeElement) {
    node = result.element;
  }

  if (result instanceof HNodeText) {
    node = result.textNode;
  }

  return {
    prevNode: node,
    lastParentHNode: config.lastParentHNode!,
  };
};
