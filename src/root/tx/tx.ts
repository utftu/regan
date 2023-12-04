import {PromiseControls, createControlledPromise} from 'utftu';
import {Action, Exec, Root} from '../root.ts';
import {TxShard} from './shard.ts';
import {Atom} from 'strangelove';

const OMITTED_LIMIT = 10;

export type Changes = Map<Atom, any>;

export class Tx {
  shards: TxShard[] = [];
  root: Root;
  changes: Changes;
  promise: Promise<any>;
  promiseControls: PromiseControls<any>;

  constructor(changes: Changes, root: Root) {
    this.changes = changes;
    this.root = root;
    const [promise, promiseControls] = createControlledPromise<any>();
    this.promise = promise;
    this.promiseControls = promiseControls;

    for (const atom of changes.keys()) {
      if (!this.root.atoms.has(atom)) {
        this.root.atoms.set(atom, {
          shards: [],
          omittedShards: [],
        });
      }

      const atomConfig = this.root.atoms.get(atom)!;
      const shard = new TxShard(this, atomConfig);
      this.shards.push(shard);
      atomConfig.shards.push(shard);
    }
  }

  // init => running => finished => closed
  // init => omitted => closed
  status: 'init' | 'omitted' | 'running' | 'finished' | 'closed' = 'init';

  checkOmmit() {
    for (const shard of this.shards) {
      if (shard.execConfig.omittedShards.length > OMITTED_LIMIT) {
        return false;
      }
      const atomConfigShards = shard.execConfig.shards;

      const position = atomConfigShards.indexOf(shard);

      if (atomConfigShards[position + 1] === undefined) {
        return false;
      }
    }
    return true;
  }

  omit() {
    const positions = [];
    for (const shard of this.shards) {
      const atomConfigShards = shard.execConfig.shards;

      const position = atomConfigShards.indexOf(shard);
      positions.push(position);

      atomConfigShards.splice(position, 1);
      shard.execConfig.omittedShards.push(shard);
    }
    this.status = 'omitted';

    for (let i = 0; i <= this.shards.length; i++) {
      const shard = this.shards[i];

      const atomConfigShards = shard.execConfig.shards;
      const nextShard = atomConfigShards[positions[i]];

      if (nextShard) {
        nextShard.tx.root.handleTx(nextShard.tx);
      }
    }
  }

  checkExec() {
    for (const shard of this.shards) {
      const atomConfigShards = shard.execConfig.shards;

      if (atomConfigShards[0] !== shard) {
        return false;
      }
    }

    return true;
  }

  async exec() {
    this.status = 'running';

    const actionPromises: Promise<Action>[] = [];
    const execs: Exec[] = [];

    for (const change of this.changes) {
      const [atom, value] = change;

      if (!this.root.links.check(atom)) {
        continue;
      }

      const execsForAtom = this.root.links.get(atom)!;

      execsForAtom.execs.forEach((exec) => {
        execs.push(exec);
        actionPromises.push(exec(value));
      });
    }
    const actions = await Promise.all(actionPromises);

    actions.forEach((action, i) => {
      this.root.planner.plan(execs[i], action);
    });

    this.root.planner.promise.then(() => {
      this.status = 'finished';
      this.root.handleTx(this);
      this.promiseControls.resolve();
    });
  }

  finish() {
    this.status = 'finished';
    this.shards.forEach((shard) => {
      shard.execConfig.shards.splice(0, 1);
    });

    // console.log('-----', 'here');
    this.promiseControls.resolve();
    this.shards.forEach((shard) => {
      shard.execConfig.omittedShards.forEach((shard) => {
        shard.tx.finishOmitted();
      });

      const txs = shard.execConfig.shards;
      if (txs.length > 0) {
        this.root.handleTx(txs[0].tx);
      }
    });

    this.status = 'closed';
  }

  finishOmitted() {
    this.status = 'closed';
    this.shards.forEach((shard) => {
      const execConfig = shard.execConfig;
      const omittedShards = execConfig.omittedShards;

      const position = omittedShards.indexOf(shard);

      omittedShards.splice(position, 1);
    });
  }
}
