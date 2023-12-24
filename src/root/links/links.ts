import {Atom, connectAtoms} from 'strangelove';
import {Exec, Root} from '../root.ts';
import {destroyAtom} from '../../atoms/atoms.ts';

type LinkConfig = {
  execs: Exec[];
  subsribeAtom: Atom;
};

export class Links {
  links: Map<Atom, LinkConfig> = new Map();
  root: Root;

  private create(atom: Atom) {
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

    this.links.set(atom, {
      execs: [],
      subsribeAtom,
    });
  }

  private delete(atom: Atom) {
    destroyAtom(this.links.get(atom)!.subsribeAtom);
    this.links.delete(atom);
  }

  constructor(root: Root) {
    this.root = root;
  }

  add(atom: Atom, exec: Exec) {
    if (!this.links.has(atom)) {
      this.create(atom);
    }

    this.links.get(atom)!.execs.push(exec);
  }

  get(atom: Atom) {
    return this.links.get(atom);
  }

  check(atom: Atom) {
    return this.links.has(atom);
  }

  remove(atom: Atom, exec: Exec) {
    if (!this.links.has(atom)) {
      return;
    }
    const newExecs = this.links
      .get(atom)!
      .execs.filter((execLocal) => exec !== execLocal);

    if (newExecs.length === 0) {
      this.delete(atom);
    } else {
      this.links.get(atom)!.execs = newExecs;
    }
  }
}
