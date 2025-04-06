import {VOldText} from '../v/types.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  start: number;
  textNode: Text;
  text: string;
};

export class HNodeText extends HNodeBase {
  start: number;
  text: string;
  textNode: Text;
  vOldText?: VOldText;
  constructor(props: PropsHNode, {textNode, start, text}: HNodeTextProps) {
    super(props);
    this.textNode = textNode;
    this.start = start;
    this.text = text;
  }
}
