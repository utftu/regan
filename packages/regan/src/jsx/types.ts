import {JsxNode} from '../jsx-node/jsx-node.ts';
import {FC} from '../types.ts';
import {A, Div, Input} from './elements.ts';

export declare namespace JSX {
  export type ElementType = string | FC<any>;
  export type Element = JsxNode;
  export type IntrinsicElements = {
    div: Div;
    a: A;
    input: Input;
  };
}
