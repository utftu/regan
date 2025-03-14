import {LisneterManager} from '../utils/listeners.ts';

export type VNewElement = {
  type: 'element';

  data: {
    tag: string;
    props: Record<string, any>;
  };
  listenerManager: LisneterManager;

  children: VNew[];
};

export type VOldElement = Omit<VNewElement, 'children'> & {
  element: Element;
  // domNode: Element;

  children: VOld[];
};

export type VNewText = {
  type: 'text';
  data: {
    text: string;
  };
};

export type VOldText = VNewText & {
  // domNode: Text;
  textNode: Text;
};

export type VNew = VNewElement | VNewText;

export type VOld = VOldElement | VOldText;
