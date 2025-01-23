import {HNodeBase, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
};

export class HNodeElement extends HNodeBase {
  element: Element;
  constructor(props: PropsHNode, {element}: HNodeElProps) {
    super(props);
    this.element = element;
  }
}
