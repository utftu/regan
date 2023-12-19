import {Atom} from 'strangelove';

export class TreeAtomsSnapshot {
  atoms: Map<Atom, any> = new Map();

  parse(atom: Atom) {
    if (this.atoms.has(atom)) {
      return;
    }
    this.atoms.set(atom, atom.get());

    atom.relations.children.forEach((localAtom) => this.parse(localAtom));
    atom.relations.parents.forEach((localAtom) => this.parse(localAtom));
  }
}
