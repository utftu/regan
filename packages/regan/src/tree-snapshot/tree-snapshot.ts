import {Atom, Root} from 'strangelove';

class TreeSnapshot {
  changedAtoms = new Map<Atom, Root>();

  subscribedRoots = new Map<Root, any>();

  parse(atom: Atom) {
    const root = atom.root;
    if (this.subscribedRoots.has(root)) {
      return;
    }

    const subsribe = () => {};
  }

  getValue(atom: Atom) {
    if (this.changedAtoms.has(atom)) {
      return this.changedAtoms.get(atom);
    }

    return atom.get();
  }
}
