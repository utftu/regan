import {A, Div} from './src/jsx/elements.ts';
import {JsxNode} from './src/node/node.ts';
import {FC} from './src/types.ts';

declare global {
  export interface Window {
    X: number;
  }

  export namespace JSX {
    type ElementType = string | FC<any>;
    type Element = JsxNode<any>;
    // type ElementType = any;
    // type Element = any;
    type IntrinsicElements = {
      div: Div;
      a: A;
    };
  }
}
