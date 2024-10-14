import {Atom} from 'strangelove';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {apply} from './apply/apply.ts';
import {convert} from './convert.ts';
import {diffOne} from './diff/diff.ts';
import {VNew} from './new.ts';
import {VOld} from './old.ts';

export type Control = {
  addNode: (node: Node) => void;
};

const virtualApply = ({
  vNews,
  vOlds,
  window,
  control,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  control: Control;
}) => {
  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew = vNews[i];
    const vOld = vOlds[i];
    const event = diffOne(vNews[i], vOlds[i]);

    const node = apply({vNew, vOld, window, event, control});

    if (vNew) {
      (vNew as VOld).domNode = node!;
    }

    if (vNew.type === 'element' || vOld.type === 'element') {
      virtualApply({
        vNews: vNew.type === 'element' ? vNew.children : [],
        vOlds: vOld.type === 'element' ? vOld.children : [],
        window,
        control: {
          addNode: (node) => {
            // we sure that vNew exist and is element, because if vNew doesn't exist we emit delete
            const vNewAsOld = vNew as VOld;
            if (vNewAsOld.type === 'element') {
              vNewAsOld.domNode.appendChild(node);
            }
          },
        },
      });
    }
  }
};

export type ElementVirtualTemplate = {
  tag: string;
  props: Record<string, any>;
  init: (elementVirtual: ElementVirtual) => void;

  children: VirtualTemplate[];
};

export type ElementVirtual = ElementVirtualTemplate & {
  element: Element;
};

export type TextVirtualTemplate = {
  text: string;
  init: (text: Text) => void;
};

export type TextVirtual = TextVirtualTemplate & {
  text: Text;
};

type VirtualTemplate = ElementVirtualTemplate | TextVirtualTemplate;

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
  hNode: HNodeElement | HNodeText
): VirtualTemplate[] => {
  if (hNode instanceof HNodeText) {
    return [
      {
        text: hNode.text,
        init: (text: Text) => {
          hNode.domNode = text;
        },
      } satisfies TextVirtualTemplate,
    ];
  }

  if (hNode instanceof HNodeElement) {
    const {joinedProps, dynamicProps} = splitProps(hNode.jsxNode.props);
    const children = hNode.children.map(convertHydatedToVirtual).flat();
    return [
      {
        tag: hNode.element.tagName.toLowerCase(),
        props: joinedProps,
        init: (elementVirtual: ElementVirtual) => {
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
      } satisfies ElementVirtualTemplate,
    ];
  }

  throw new Error('Unknown hNode type');
};
