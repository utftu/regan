import {Atom, connectAtoms} from 'strangelove';
import {Root} from '../root.ts';
import {TxShard} from '../tx/shard.ts';
import {destroyAtom} from '../../atoms/atoms.ts';
import {Exec} from './atoms-store.ts';
import {HNodeAtomWrapper} from '../../h-node/component.ts';
import {execsStoreHandler} from '../../components/atom-wrapper/execs-store-handler.ts';

export class ExecsStore {
  root: Root;
  atom: Atom;
  execs: Exec[] = [];
  subsribeAtom: Atom;
  shards: TxShard[] = [];
  omittedShards: TxShard[] = [];

  // need to atomWrappers
  atomWrappers: HNodeAtomWrapper[] = [];

  constructor(atom: Atom, root: Root) {
    this.atom = atom;
    this.root = root;

    const self = this;

    const subsribeAtom = new Atom({
      root: atom.root,
      exec: async () => {
        const value = atom.get();

        let changes: Map<Atom, any>;

        if (self.atomWrappers.length > 0) {
          const localChanges = execsStoreHandler(self);

          changes = localChanges;
        } else {
          changes = new Map([[atom, value]]);
        }

        const promise = this.root.addTx(changes);

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
