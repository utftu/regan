import {Atom} from 'strangelove';
import {VNew, VNewElement, VNewText, VOldElement} from '../v.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {HNodeText} from '../../h-node/text.ts';
import {HNode} from '../../h-node/h-node.ts';
import {splitProps} from './convert.ts';

export const convertHydatedToVirtualMulti = (hNodes: HNode[]) => {
  return hNodes.map(convertHydatedToVirtualSingle).flat();
};

export const convertHydatedToVirtualSingle = (hNode: HNode): VNew[] => {
  if (hNode instanceof HNodeText) {
    return [
      {
        type: 'text',
        text: hNode.text,
        init: (text: Text) => {
          hNode.domNode = text;
        },
      } satisfies VNewText,
    ];
  }

  if (hNode instanceof HNodeElement) {
    const {joinedProps, dynamicProps} = splitProps(hNode.jsxNode.props);
    const children = hNode.children.map(convertHydatedToVirtualSingle).flat();
    return [
      {
        type: 'element',
        tag: hNode.element.tagName.toLowerCase(),
        props: joinedProps,
        init: (elementVirtual: VOldElement) => {
          const unsubscribes: (() => void)[] = [];
          for (const key in dynamicProps) {
            const value = dynamicProps[key];
            if (value instanceof Atom) {
              const subscribe = (newValue: any) => {
                elementVirtual.props[key] = newValue;
              };
              value.listeners.subscribe(subscribe);
              unsubscribes.push(() => {
                value.listeners.unsubscribe(subscribe);
              });
            }
          }

          hNode.unmounts.push(() => {
            unsubscribes.forEach((fn) => fn());
          });
        },
        children,
      } satisfies VNewElement,
    ];
  }

  return convertHydatedToVirtualMulti(hNode.children);

  // throw new Error('Unknown hNode type');
};
