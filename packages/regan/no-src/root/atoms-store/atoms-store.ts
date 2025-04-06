import {Atom} from 'strangelove';
import {Root} from '../root.ts';
import {ExecsStore} from './execs-store.ts';

export type Exec = (value: any) => Promise<any> | any;

export class AtomsStore {
  atoms: Map<Atom, ExecsStore> = new Map();
  root: Root;

  private create(atom: Atom) {
    this.atoms.set(atom, new ExecsStore(atom, this.root));
  }

  private delete(atom: Atom) {
    this.atoms.get(atom)!.clean();
    this.atoms.delete(atom);
  }

  constructor(root: Root) {
    this.root = root;
  }

  get(atom: Atom) {
    return this.atoms.get(atom);
  }

  check(atom: Atom) {
    return this.atoms.has(atom);
  }

  addExec(atom: Atom, exec: Exec) {
    if (!this.atoms.has(atom)) {
      this.create(atom);
    }

    this.atoms.get(atom)!.execs.push(exec);
  }

  removeExec(atom: Atom, exec: Exec) {
    const linkConfig = this.atoms.get(atom)!;
    const newExecs = linkConfig.execs.filter((execLocal) => exec !== execLocal);

    if (newExecs.length === 0) {
      this.delete(atom);
    } else {
      linkConfig.execs = newExecs;
    }
  }

  replaceExec(atom: Atom, exec: Exec, newExec: Exec) {
    if (!this.check(atom)) {
      return;
    }

    const execs = this.atoms.get(atom)!.execs;
    const i = execs.indexOf(exec);
    if (i === -1) {
      return;
    }

    execs[i] = newExec;
  }
}
