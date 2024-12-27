import {JsxNodeElement} from '../node/variants/element/element.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
  // jsxNode: JsxNodeElement;
};

export class HNodeElement extends HNodeBase {
  jsxNode: JsxNodeElement;
  element: Element;
  constructor(props: PropsHNode, {jsxNode, element}: HNodeElProps) {
    super(props);
    this.jsxNode = jsxNode;
    this.element = element;
  }
}
