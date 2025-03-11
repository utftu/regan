type BaseElement<TElement extends Element = any> = {
  click?: (event: MouseEvent) => void;
  id?: string;
} & Record<string, any>;

export type Div = BaseElement & {};

export type A = BaseElement & {
  href: string;
  target?: string;
};

export type Input = BaseElement & {
  input?: (event: InputEvent) => void;
};
