import {DomPointer} from '../types.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeElement extends HNodeBase {
  // el: HTMLElement;
  domPointer: DomPointer;
  constructor(props: PropsHNode, {domPointer}: {domPointer: DomPointer}) {
    super(props);
    // this.el = el;
    this.domPointer = domPointer;
  }
}
