import {Atom} from 'strangelove';
import {HNodeBase, PropsHNode} from './h-node.ts';
import {AnyFunc} from '../types.ts';

export class HNodeComponent extends HNodeBase {}

export class HNodeAtomWrapper extends HNodeComponent {
  atom: Atom;

  rendering = false;
  willUnmount = false;
  atomSubsriber: AnyFunc | undefined;
  unsibscribeWrapper: AnyFunc | undefined;

  constructor(props: PropsHNode, {atom}: {atom: Atom}) {
    super(props);
    this.atom = atom;
  }
}
