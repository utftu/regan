import {JSX as JSXOrig} from './src/jsx/types.ts';

declare global {
  export interface Window {
    X: number;
  }

  namespace JSX {
    type ElementType = JSXOrig.ElementType;
    type Element = JSXOrig.Element;
    type IntrinsicElements = JSXOrig.IntrinsicElements;
  }
}
