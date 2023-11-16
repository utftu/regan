import {HNode, PropsHydratedNode} from './h-node.ts';

export class Elems {
  first: HTMLElement;
  last: HTMLElement;

  constructor(first: HTMLElement, last: HTMLElement) {
    this.first = first;
    this.last = last;
  }
}

export class HNodeComponent extends HNode {
  elems?: Elems;

  constructor(props: PropsHydratedNode & {elems?: Elems}) {
    super(props);
    this.elems = props.elems;
  }
}
