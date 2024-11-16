import {VOldText} from '../v/types.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  start: number;
  domNode: Text;
  text: string;
};

export class HNodeText extends HNodeBase {
  start: number;
  text: string;
  domNode: Text;
  vOldText?: VOldText;
  constructor(props: PropsHNode, {domNode, start, text}: HNodeTextProps) {
    super(props);
    this.domNode = domNode;
    this.start = start;
    this.text = text;
  }
}
