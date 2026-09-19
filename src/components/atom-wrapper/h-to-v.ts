import {HNode} from '../../h-node/h-node.ts';
import {JsxNodeElement} from '../../jsx-node/variants/element/element.ts';
import {checkClassChild} from '../../utils/check-parent.ts';
import {VOld, VOldElement, VOldText} from '../../v/types.ts';

export const convertHToV = (hNode: HNode): VOld[] => {
  if (checkClassChild(hNode, 'hNodeText')) {
    const vOld: VOldText = {
      type: 'text',
      data: {
        text: hNode.text,
      },
      textNode: hNode.textNode,
    };

    return [vOld];
  }

  if (checkClassChild(hNode, 'hNodeElement')) {
    const children = hNode.children.map((hNode) => convertHToV(hNode)).flat();

    const jsxNodeElement = hNode.segmentEnt.jsxNode as JsxNodeElement;

    const vOld: VOldElement = {
      type: 'element',
      data: {
        tag: jsxNodeElement.tagName,
        props: jsxNodeElement.props,
      },
      element: hNode.element,
      listenerManager: hNode.listenerManager,
      children,
    };

    return [vOld];
  }

  if (checkClassChild(hNode, 'hNodeComponent')) {
    return hNode.children.map((hNode) => convertHToV(hNode)).flat();
  }

  throw new Error('Unknown HNode type');
};
