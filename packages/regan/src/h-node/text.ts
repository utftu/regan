import {DomPointer} from '../types.ts';
import {HNodeDomNode} from './element.ts';
import {PropsHNode} from './h-node.ts';

export class HNodeText extends HNodeDomNode {
  start: number;
  finish: number;
  constructor(
    props: PropsHNode,
    secondProps: {domPointer: DomPointer},
    {start, finish}: {start: number; finish: number}
  ) {
    super(props, secondProps);
    this.start = start;
    this.finish = finish;
  }
}
