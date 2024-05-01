import {Atom} from 'strangelove';
import {Planner} from './planner/planner.ts';
import {Links} from './links/links.ts';
import {Changes, Tx} from './tx/tx.ts';
import {ExecConfig} from './tx/shard.ts';

export type Action = () => void;
export type Exec = (value: any) => Promise<any> | any;

export class Root {
  links: Links;
  atoms: Map<Atom, ExecConfig> = new Map();

  constructor() {
    this.links = new Links(this);
  }

  // not check prev
  handleTx(tx: Tx) {
    if (tx.status === 'running') {
      return;
    }

    if (tx.status === 'omitted') {
      return;
    }

    if (tx.status === 'closed') {
      return;
    }

    if (tx.status === 'finished') {
      return;
    }

    if (tx.status === 'init' && tx.checkOmmit()) {
      tx.omit();
      return;
    }

    if (tx.status === 'init' && tx.checkExec()) {
      tx.exec();
      return;
    }
  }

  addTx(changes: Changes) {
    const tx = new Tx(changes, this);

    queueMicrotask(() => {
      this.handleTx(tx);
    });

    return tx.promise;
  }

  addExec(atom: Atom, exec: Exec) {
    this.links.add(atom, exec);
    if (!this.atoms.has(atom)) {
      this.atoms.set(atom, new ExecConfig());
    }
  }

  removeExec(atom: Atom, exec: Exec) {
    this.links.remove(atom, exec);
    if (!this.links.check(atom)) {
      this.atoms.delete(atom);
    }
  }

  replaceExec(atom: Atom, exec: Exec, newExec: Exec) {
    if (!this.links.check(atom)) {
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
