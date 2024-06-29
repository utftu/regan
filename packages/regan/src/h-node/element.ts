import {DomPointer} from '../types.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeDomNode extends HNodeBase {
  domPointer: DomPointer;
  constructor(props: PropsHNode, {domPointer}: {domPointer: DomPointer}) {
    super(props);
    this.domPointer = domPointer;
  }
}
