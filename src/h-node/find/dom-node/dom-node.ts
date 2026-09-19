import {checkClassChild} from '../../../utils/check-parent.ts';
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
      if (checkClassChild(hNode, 'hNodeElement')) {
        return hNode;
      }

      if (checkClassChild(hNode, 'hNodeText')) {
        return hNode;
      }
    },
    config
  );

  if (checkClassChild(result, 'hNodeElement')) {
    return {domNode: result.element, lastParentHNode: config.lastParentHNode};
  }

  if (checkClassChild(result, 'hNodeText')) {
    return {domNode: result.textNode, lastParentHNode: config.lastParentHNode};
  }

  return {
    lastParentHNode: config.lastParentHNode,
  };
};
