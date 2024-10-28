import {handle} from './handle/handle.ts';

export type VNewElement = {
  type: 'element';
  tag: string;
  props: Record<string, any>;
  init?: (elementVirtual: VOldElement, vOld: VOldElement) => void;

  children: VNew[];
};

export type VOldElement = VNewElement & {
  node: Element;

  children: VOldElement[];
};

export type VNewText = {
  type: 'text';
  text: string;
  init?: (text: Text, vOld: VOldText) => void;
};

export type VOldText = VNewText & {
  node: Text;
};

export type VNew = VNewElement | VNewText;

export type VOld = VOldElement | VOldText;

export const virtualApply = ({
  vNews,
  vOlds,
  window,
  parentElement,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  parentElement: Element;
}) => {
  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew: VNew | undefined = vNews[i];
    const vOld: VOld | undefined = vOlds[i];
    const {node, type} = handle(vNews[i], vOlds[i], window, parentElement);

    // make vNew vOld
    if (type !== 'delete') {
      (vNew as VOld).node = node;
      vNew.init?.(node as any, vOld as any);
    }

    if (vNew.type === 'element') {
      virtualApply({
        vNews: vNew.type === 'element' ? vNew.children : [],
        vOlds: vOld.type === 'element' ? vOld.children : [],
        parentElement,
        window,
      });
    }
  }
};
