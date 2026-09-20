import {HNodeBase, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  text: string;
  textNode: Text;
};

export class HNodeText extends HNodeBase {
  type = 'text' as const;

  text: string;
  textNode: Text;

  constructor(props: PropsHNode, {text, textNode}: HNodeTextProps) {
    super(props);
    this.text = text;
    this.textNode = textNode;
  }
}
