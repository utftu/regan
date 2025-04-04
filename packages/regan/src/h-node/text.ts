import {HNode, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  text: string;
};

export class HNodeText extends HNode {
  text: string;
  textNode: Text;
  constructor(props: PropsHNode, {text}: HNodeTextProps) {
    super(props);
    this.text = text;
  }
}
