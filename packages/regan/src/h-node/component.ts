import {Atom} from 'strangelove';
import {HNodeBase, PropsHNode} from './h-node.ts';

export class HNodeComponent extends HNodeBase {}

export class HNodeAtomWrapper extends HNodeComponent {
  atom: Atom;

  rendering = false;
  willUnmount = false;

  constructor(props: PropsHNode, {atom}: {atom: Atom}) {
    super(props);
    this.atom = atom;
  }
}
