import {HNode, PropsHNode} from './h-node.ts';

export class HNodeElement extends HNode {
  el: HTMLElement;
  constructor(props: PropsHNode, el: HTMLElement) {
    super(props);
    this.el = el;
  }
}
