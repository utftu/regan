import {Atom} from 'strangelove';
import {HNodeText} from '../../../h-node/text.ts';
import {HNodeElement} from '../../../h-node/element.ts';
import {VNew, VNewElement, VNewText, VOldElement} from '../v.ts';

const splitProps = (props: Record<string, any>) => {
  const joinedProps: Record<string, any> = {};
  const dynamicProps: Record<string, any> = {};

  for (const key in props) {
    const value = props[key];
    if (value instanceof Atom) {
      const atomValue = value.get();
      joinedProps[key] = atomValue;
    } else {
      dynamicProps[key] = props[key];
    }
  }

  return {joinedProps, dynamicProps};
};

export const convertHydatedToVirtual = (
  hNodes: (HNodeElement | HNodeText)[]
) => {
  return hNodes.map(convertHydatedToVirtualSingle).flat();
};

export const convertHydatedToVirtualSingle = (
  hNode: HNodeElement | HNodeText
): VNew[] => {
  if (hNode instanceof HNodeText) {
    return [
      {
        type: 'text',
        text: hNode.text,
        start: hNode.start,
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

  throw new Error('Unknown hNode type');
};
