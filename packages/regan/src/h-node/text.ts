import {HNodeBase, PropsHNode} from './h-node.ts';

export type HNodeTextProps = {
  // atomDirectNode: boolean;
  start: number;
  // finish: number;
  domNode: Text;
  text: string;
};

export class HNodeText extends HNodeBase {
  start: number;
  // finish: number;
  text: string;
  domNode: Text;
  // atomDirectNode: boolean;
  constructor(
    props: PropsHNode,
    {
      domNode,
      start,
      // finish,
      // atomDirectNode,
      text,
    }: HNodeTextProps
  ) {
    super(props);
    this.domNode = domNode;
    this.start = start;
    // this.finish = finish;
    // this.atomDirectNode = atomDirectNode;
    this.text = text;
  }
}

type A = InstanceType<typeof HNodeText>;

const a = null as any as A;

a.children;

// const a: A = {
//   start: 1,
//   finish: 1,
//   text: '',
//   atomDirectNode: true,
// };
