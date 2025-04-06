import {Atom} from 'strangelove';
import {HNodeBase, PropsHNode} from './h-node.ts';
import {AnyFunc} from '../types.ts';

export class HNodeComponent extends HNodeBase {}

export class AtomWrapperData {
  atom: Atom;
  hNode: HNodeComponent;

  rendering = false;
  willUnmount = false;
  // param for unsubscribe before unmount, to not react on changes when parent is going to render
  unsibscribeWrapper: AnyFunc | undefined;

  constructor({atom, hNode}: {atom: Atom; hNode: HNodeComponent}) {
    this.atom = atom;
    this.hNode = hNode;
  }
}
