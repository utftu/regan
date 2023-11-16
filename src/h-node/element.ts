import {HNode, PropsHydratedNode} from './h-node.ts';

export class HNodeElement extends HNode {
  elem: HTMLElement;

  constructor(props: PropsHydratedNode & {elem: HTMLElement}) {
    super(props);
    this.elem = props.elem;
  }
}
