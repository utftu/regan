import {handle} from './diff/diff.ts';

export type VNewElement = {
  type: 'element';
  tag: string;
  props: Record<string, any>;
  init: (elementVirtual: VOldElement) => void;

  children: VNew[];
};

export type VOldElement = VNewElement & {
  node: Element;

  children: VOldElement[];
};

export type VNewText = {
  type: 'text';
  text: string;
  start: number;
  init: (text: Text) => void;
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
    const vNew = vNews[i];
    const vOld = vOlds[i];
    handle(vNews[i], vOlds[i], window, parentElement);

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
