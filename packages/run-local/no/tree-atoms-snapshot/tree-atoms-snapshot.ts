import {Atom, Root} from 'strangelove';

export class TreeAtomsSnapshot {
  changedAtomValues = new Map<Atom, any>();
  parsedAtoms = new Set();

  subscribedRoots = new Map<
    Root,
    {
      unsubsribeChange: () => void;
    }
  >();

  parse(atom: Atom) {
    this.parsedAtoms.add(atom);

    const root = atom.root;
    if (this.subscribedRoots.has(root)) {
      return;
    }

    const subsribeChange = (atom: Atom) => {
      this.changedAtomValues.set(atom, atom.value.prevValue);
    };

    const unsubsribeChange = root.ee.on('change', subsribeChange);
    this.subscribedRoots.set(root, {
      unsubsribeChange,
    });
  }

  getValue(atom: Atom) {
    this.parse(atom);

    if (this.changedAtomValues.has(atom)) {
      return this.changedAtomValues.get(atom);
    }

    return atom.get();
  }

  unsubsribe() {
    this.subscribedRoots.forEach(({unsubsribeChange}) => unsubsribeChange());
  }
}
