type InputEventRegan = Omit<InputEvent, 'target'> & {target: HTMLInputElement};

type BaseElement<TElement extends Element = any> = {
  id?: string;
  style?: string;
  class?: string;
  className?: string;
  title?: string;
  hidden?: boolean;
  tabIndex?: number;

  click?: (event: MouseEvent, element: TElement) => void;
  keydown?: (event: KeyboardEvent, element: TElement) => void;
  keyup?: (event: KeyboardEvent, element: TElement) => void;
  focus?: (event: FocusEvent, element: TElement) => void;
  blur?: (event: FocusEvent, element: TElement) => void;
  mouseover?: (event: MouseEvent, element: TElement) => void;
  mouseout?: (event: MouseEvent, element: TElement) => void;
} & Record<string, any>;

export type Div = BaseElement & {};

export type Span = BaseElement & {};

export type Img = BaseElement<HTMLImageElement> & {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'eager' | 'lazy';
};

export type A = BaseElement & {
  href: string;
  target?: string;
};

export type Input = BaseElement & {
  input?: (event: InputEventRegan, element: HTMLInputElement) => void;
};

export type Html = {};

export type Head = {};

export type Body = {};

export type Script = BaseElement & {
  type?: string;
  src: string;
};
