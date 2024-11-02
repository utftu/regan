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

export type VNewTextPartial = {
  type: 'text';
  text: string;
  init?: (text: Text, vOld: VOldText) => void;
};

export type VNew = VNewElement | VNewText;

export type VOld = VOldElement | VOldText;
