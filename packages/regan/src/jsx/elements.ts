type InputEventRegan = Omit<InputEvent, 'target'> & {target: HTMLInputElement};

type BaseElement<TElement extends Element = any> = {
  click?: (event: MouseEvent, element: TElement) => void;
  id?: string;
  style?: string;
  class?: string;
  className?: string;
} & Record<string, any>;

export type Div = BaseElement & {};

export type Span = BaseElement & {};

export type Img = BaseElement & {};

export type A = BaseElement & {
  href: string;
  target?: string;
};

export type Input = BaseElement & {
  input?: (event: InputEventRegan, element: HTMLInputElement) => void;
};
