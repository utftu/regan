import {Atom} from 'strangelove';
import {Root} from '../root.ts';
import {LinkConfig} from './link-config.ts';

export type Exec = (value: any) => Promise<any> | any;

export class Links {
  links: Map<Atom, LinkConfig> = new Map();
  root: Root;

  private create(atom: Atom) {
    this.links.set(atom, new LinkConfig(atom, this.root));
  }

  private delete(atom: Atom) {
    this.links.get(atom)!.clean();
    this.links.delete(atom);
  }

  constructor(root: Root) {
    this.root = root;
  }

  get(atom: Atom) {
    return this.links.get(atom);
  }

  check(atom: Atom) {
    return this.links.has(atom);
  }

  addExec(atom: Atom, exec: Exec) {
    if (!this.links.has(atom)) {
      this.create(atom);
    }

    this.links.get(atom)!.execs.push(exec);
  }

  removeExec(atom: Atom, exec: Exec) {
    const linkConfig = this.links.get(atom)!;
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

    const execs = this.links.get(atom)!.execs;
    const i = execs.indexOf(exec);
    if (i === -1) {
      return;
    }

    execs[i] = newExec;
  }
}
