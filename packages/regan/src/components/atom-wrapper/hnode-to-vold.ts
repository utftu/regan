import {Atom} from 'strangelove';
import {HNodeComponent} from '../../h-node/component.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeText} from '../../h-node/text.ts';
import {VOld, VOldText} from '../../v/types.ts';

export const convertHNodesToVOls = (
  hNode: HNode,
  store: {vOldText?: VOldText}
): VOld[] => {
  if (hNode instanceof HNodeText) {
    if (!store.vOldText) {
      store.vOldText = {
        type: 'text',
        data: {
          text: '',
        },
        textNode: hNode.textNode,
      };
      return [store.vOldText];
    }
    return [];
  }

  if (hNode instanceof HNodeElement) {
    const props: Record<string, any> = {};
    const propsWithAtoms = hNode.segmentEnt.jsxNode.props;
    for (const propKey in propsWithAtoms) {
      const value = propsWithAtoms[propKey];
      if (value instanceof Atom) {
        props[propKey] = value.get();
      } else {
        props[propKey] = value;
      }
    }
    // const {joinedProps} = splitProps(hNode.segmentEnt.jsxNode.props, {} as any);
    const vOld: VOld = {
      type: 'element',
      data: {
        tag: hNode.element.tagName,
        props: props,
      },
      element: hNode.element,
      listenerManager: hNode.listenerManager,
      children: [],
      keyStore: {},
    };

    const children = hNode.children
      .map((hNode) => convertHNodesToVOls(hNode, store).flat())
      .flat();
    vOld.children = children;

    return [vOld];
  }

  if (hNode instanceof HNodeComponent) {
    const children = hNode.children
      .map((hNode) => convertHNodesToVOls(hNode, store).flat())
      .flat();
    return children;
  }

  throw new Error('Unknown hNode type');
};
