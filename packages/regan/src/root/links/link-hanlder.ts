import {Atom, connectAtoms} from 'strangelove';
import {Root} from '../root.ts';
import {TxShard} from '../tx/shard.ts';
import {destroyAtom} from '../../atoms/atoms.ts';
import {Exec} from './links.ts';
import {HNodeAtomWrapper} from '../../h-node/component.ts';
import {collectAtoms} from '../../components/atom-wrapper/atom-wrapper.tsx';

export class LinkHandler {
  root: Root;
  atom: Atom;
  execs: Exec[] = [];
  subsribeAtom: Atom;
  shards: TxShard[] = [];
  omittedShards: TxShard[] = [];

  //
  atomWrappers: HNodeAtomWrapper[] = [];
  // atomWrappersCount = 0;

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
          const innerAtomsFromWrappers: Atom[] = [];

          self.atomWrappers.forEach((atomWrapper) => {
            collectAtoms(atomWrapper, innerAtomsFromWrappers);
          });

          const localChanges = innerAtomsFromWrappers.reduce((map, atom) => {
            if (map.has(atom)) {
              return map;
            }
            map.set(atom, atom.get());
            return map;
          }, new Map());

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
