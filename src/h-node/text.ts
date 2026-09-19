import {defineClassName} from '../utils/check-parent.ts';
import {VOldText} from '../v/types.ts';
import {HNode, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  text: string;
  textNode: Text;
};

export class HNodeText extends HNode {
  text: string;
  textNode: Text;
  constructor(props: PropsHNode, {text, textNode}: HNodeTextProps) {
    super(props);
    this.text = text;
    this.textNode = textNode;
  }
}
defineClassName(HNodeText, 'hNodeText');
