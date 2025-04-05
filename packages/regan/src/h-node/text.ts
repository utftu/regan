import {VOldText} from '../v/types.ts';
import {HNode, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  text: string;
  textNode: Text;
  vOld?: VOldText;
};

export class HNodeText extends HNode {
  text: string;
  textNode: Text;
  vOld?: VOldText;
  constructor(props: PropsHNode, {text, textNode, vOld}: HNodeTextProps) {
    super(props);
    this.text = text;
    this.textNode = textNode;
    this.vOld = vOld;
  }
}
