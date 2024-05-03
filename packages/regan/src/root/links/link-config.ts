import {Atom, connectAtoms} from 'strangelove';
import {Root} from '../root.ts';
import {TxShard} from '../tx/shard.ts';
import {destroyAtom} from '../../atoms/atoms.ts';
import {Exec} from './links.ts';

export class LinkConfig {
  root: Root;
  atom: Atom;
  execs: Exec[] = [];
  subsribeAtom: Atom;
  shards: TxShard[] = [];
  omittedShards: TxShard[] = [];

  constructor(atom: Atom, root: Root) {
    this.atom = atom;
    this.root = root;

    const subsribeAtom = new Atom({
      root: atom.root,
      exec: async () => {
        const value = atom.get();

        const promise = this.root.addTx(new Map([[atom, value]]));

        await promise;
        return true;
      },
    });
    connectAtoms(atom, subsribeAtom);

    this.subsribeAtom = subsribeAtom;
  }

  clean() {
    destroyAtom(this.subsribeAtom);
  }
}
