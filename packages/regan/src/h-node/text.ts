import {HNodeBase, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  atomDirectNode: boolean;
  start: number;
  finish: number;
  domNode: Node;
  text: string;
};

type HNodeTextType = {
  start: number;
  finish: number;
  text: string;
  atomDirectNode: boolean;
};

export class HNodeText extends HNodeBase {
  start: number;
  finish: number;
  text: string;
  domNode: Node;
  atomDirectNode: boolean;
  constructor(
    props: PropsHNode,
    {domNode, start, finish, atomDirectNode, text}: HNodeTextProps
  ) {
    super(props);
    this.domNode = domNode;
    this.start = start;
    this.finish = finish;
    this.atomDirectNode = atomDirectNode;
    this.text = text;
  }
}
