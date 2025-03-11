import {A, Div, Input} from './elements.ts';
import {JsxNode} from '../node/node.ts';
import {FC} from '../types.ts';

export interface Window {
  X: number;
}

export declare namespace JSX {
  export type ElementType = string | FC<any>;
  export type Element = JsxNode<any, any>;
  export type IntrinsicElements = {
    div: Div;
    a: A;
    input: Input;
  };
}
