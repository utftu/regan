type MetaExtend = {
  meta: {
    // skipEdge: boolean;
    skip: boolean;
  };
};

export type VNewElement = {
  type: 'element';

  data: {
    tag: string;
    props: Record<string, any>;
  };
  // tag: string;
  // props: Record<string, any>;
  init?: (vOld: VOldElement) => void;

  children: VNew[];
} & MetaExtend;

export type VOldElement = VNewElement & {
  element: Element;

  children: VOldElement[];
};

export type VNewText = {
  type: 'text';
  data: {
    text: string;
  };
  // text: string;
  init?: (vOld: VOldText) => void;
} & MetaExtend;

export type VOldText = VNewText & {
  textNode: Text;
};

// export type VNewTextPartial = {
//   type: 'text';
//   text: string;
//   init?: (text: Text, vOld: VOldText) => void;
// };

export type VNew = VNewElement | VNewText;

export type VOld = VOldElement | VOldText;
