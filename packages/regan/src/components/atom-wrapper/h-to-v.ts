import {HNodeComponent} from '../../h-node/component.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeText} from '../../h-node/text.ts';
import {JsxNodeElement} from '../../jsx-node/variants/element/element.ts';
import {VOld, VOldElement, VOldText} from '../../v/types.ts';

export const convertHToV = (
  hNode: HNode,
  store: {text?: VOldText} = {}
): VOld[] => {
  if (hNode instanceof HNodeText) {
    if (!store.text) {
      store.text = {
        type: 'text',
        data: {
          text: hNode.text,
        },
        textNode: hNode.textNode,
      } satisfies VOldText;
    } else {
      store.text.data.text += hNode.text;
    }

    return [store.text];
  }

  if (hNode instanceof HNodeElement) {
    store.text = undefined;
    const children = hNode.children
      .map((hNode) => convertHToV(hNode, store))
      .flat();
    store.text = undefined;

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

  if (hNode instanceof HNodeComponent) {
    const children = hNode.children
      .map((hNode) => convertHToV(hNode, store))
      .flat();

    return children;
  }

  throw new Error('Unknown HNode type');
};
