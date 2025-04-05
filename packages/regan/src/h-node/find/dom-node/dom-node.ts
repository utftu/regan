import {HNodeElement} from '../../element.ts';
import {HNode} from '../../h-node.ts';
import {HNodeText} from '../../text.ts';
import {Config} from '../find.ts';
import {findPrevHNode} from '../prev.ts';

export const findPrevDomNodeHNode = (
  hNode: HNode
): {domNode?: Node; lastParentHNode?: HNode} => {
  const config: Config = {};
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

  if (result instanceof HNodeElement) {
    return {domNode: result.element, lastParentHNode: config.lastParentHNode};
  }

  if (result instanceof HNodeText) {
    return {domNode: result.textNode, lastParentHNode: config.lastParentHNode};
  }

  return {
    lastParentHNode: config.lastParentHNode,
  };
};
