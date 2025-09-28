import {JsxNode} from '../jsx-node/jsx-node.ts';
import {FC} from '../types.ts';
import {A, Div, Head, Html, Input, Body, Script} from './elements.ts';

export declare namespace JSX {
  export type ElementType = string | FC<any>;
  export type Element = JsxNode;
  export type IntrinsicElements = {
    div: Div;
    a: A;
    input: Input;
    html: Html;
    head: Head;
    body: Body;
    script: Script;
  };
}
