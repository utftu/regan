import {Atom} from 'strangelove';
import {Planner} from './planner/planner.ts';
import {Links} from './links/links.ts';
import {Changes, Tx} from './tx/tx.ts';
import {ExecConfig} from './tx/shard.ts';

export type Action = () => void;
export type Exec = (value: any) => Promise<Action>;

export class Root {
  planner = new Planner();
  links: Links;
  atoms: Map<Atom, ExecConfig> = new Map();

  constructor() {
    this.links = new Links(this);
  }

  // not check prev
  handleTx(tx: Tx) {
    // console.log('-----', 'tx', tx);
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
    debugger;
    const tx = new Tx(changes, this);

    this.handleTx(tx);

    return tx.promise;
  }
}
