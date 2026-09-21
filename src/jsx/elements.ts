import {Atom} from 'strangelove';
import {Ref} from '../types.ts';

// любой атрибут можно задать атомом — тогда regan подпишется и будет
// обновлять его точечно, не пересобирая элемент
type Dyn<TValue> = TValue | Atom<TValue>;

// style принимает и строку, и объект: горбатые имена превращаются в дефисные
type Style = string | Record<string, string | number>;

type InputEventRegan = Omit<InputEvent, 'target'> & {target: HTMLInputElement};

type BaseElement<TElement extends Element = any> = {
  key?: string;
  ref?: Ref;
  rawHtml?: string;

  id?: Dyn<string>;
  style?: Dyn<Style>;
  class?: Dyn<string>;
  className?: Dyn<string>;
  title?: Dyn<string>;
  hidden?: Dyn<boolean>;
  tabIndex?: Dyn<number>;

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
  src: Dyn<string>;
  alt?: Dyn<string>;
  width?: Dyn<number | string>;
  height?: Dyn<number | string>;
  loading?: Dyn<'eager' | 'lazy'>;
};

export type A = BaseElement & {
  href: Dyn<string>;
  target?: Dyn<string>;
};

export type Input = BaseElement & {
  input?: (event: InputEventRegan, element: HTMLInputElement) => void;
};

export type Template = BaseElement;

export type Html = {};

export type Head = {};

export type Body = {};

export type Script = BaseElement & {
  type?: Dyn<string>;
  src: Dyn<string>;
};
