import {DomPointer} from '../types.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeText extends HNodeBase {
  start: number;
  finish: number;
  domNode: Node;
  constructor(
    props: PropsHNode,
    {domNode, start, finish}: {start: number; finish: number; domNode: Node}
  ) {
    super(props);
    this.domNode = domNode;
    this.start = start;
    this.finish = finish;
  }
}
