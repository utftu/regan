import {DomPointer} from '../utils/dom.ts';
import {HNode, PropsHNode} from './h-node.ts';

export class HNodeElement extends HNode {
  // el: HTMLElement;
  domPointer: DomPointer;
  constructor(
    props: PropsHNode,
    {el, domPointer}: {el: HTMLElement; domPointer: DomPointer}
  ) {
    super(props);
    // this.el = el;
    this.domPointer = domPointer;
  }
}
