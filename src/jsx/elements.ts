import {Ion} from 'strangelove';
import {Ref} from '../types.ts';

// любой атрибут можно задать атомом — тогда regan подпишется и будет
// обновлять его точечно, не пересобирая элемент. Ion, а не Atom: читать
// одинаково годятся и источник, и результат select
type Dyn<TValue> = TValue | Ion<TValue>;

// style принимает и строку, и объект: горбатые имена превращаются в дефисные
type Style = string | Record<string, string | number>;

type InputEventRegan = Omit<InputEvent, 'target'> & {target: HTMLInputElement};

// Обработчик получает один объект: {event, element}.
type Listener<TEvent, TElement> = (props: {
  event: TEvent;
  element: TElement;
}) => void;

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

  click?: Listener<MouseEvent, TElement>;
  keydown?: Listener<KeyboardEvent, TElement>;
  keyup?: Listener<KeyboardEvent, TElement>;
  focus?: Listener<FocusEvent, TElement>;
  blur?: Listener<FocusEvent, TElement>;
  mouseover?: Listener<MouseEvent, TElement>;
  mouseout?: Listener<MouseEvent, TElement>;
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
  input?: Listener<InputEventRegan, HTMLInputElement>;
};

export type Template = BaseElement;

export type Html = {};

export type Head = {};

export type Body = {};

export type Script = BaseElement & {
  type?: Dyn<string>;
  src: Dyn<string>;
};
