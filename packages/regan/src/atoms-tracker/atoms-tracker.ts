import {Atom} from 'strangelove';
import {AnyFunc} from '../types.ts';

type AtomConfig = {
  funcs: AnyFunc[];
  subscriber: AnyFunc;
  changed: boolean;
};

export class AtomsTracker {
  atoms: Map<Atom, AtomConfig> = new Map();

  add(atom: Atom, callback: AnyFunc) {
    if (!this.atoms.has(atom)) {
      const atomConfig: AtomConfig = {
        funcs: [callback],
        changed: false,
        subscriber: () => {
          atomConfig.changed = true;
        },
      };

      atom.listeners.subscribe(atomConfig.subscriber);

      return;
    }
    this.atoms.get(atom)!.funcs.push(callback);
  }

  finish() {
    for (const [atom, atomConfig] of this.atoms.entries()) {
      atom.listeners.unsubscribe(atomConfig.subscriber);

      if (atomConfig.changed) {
        atomConfig.funcs.forEach((fun) => fun());
      }
    }
  }
}
