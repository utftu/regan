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

      new TxShard(this, this.root.atoms.get(atom)!);
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
    this.status = 'omitted';
    const positions = [];
    for (const shard of this.shards) {
      const atomConfigShards = shard.execConfig.shards;

      const position = atomConfigShards.indexOf(shard);
      positions.push(position);

      atomConfigShards.splice(position, 1);
      shard.execConfig.omittedShards.push(shard);
    }

    for (let i = 0; i < this.shards.length; i++) {
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

    const execResults: Promise<Action>[] = [];

    for (const change of this.changes) {
      const [atom, value] = change;

      if (!this.root.links.check(atom)) {
        continue;
      }

      const execsForAtom = this.root.links.get(atom)!;

      execsForAtom.execs.forEach((exec) => {
        execResults.push(exec(value));
      });
    }
    await Promise.all(execResults);

    this.finish();
  }

  finish() {
    this.status = 'finished';
    this.shards.forEach((shard) => {
      shard.execConfig.shards.splice(0, 1);
    });

    this.promiseControls.resolve();
    this.shards.forEach((shard) => {
      shard.execConfig.omittedShards.forEach((shard) => {
        shard.tx.finishOmitted();
      });

      const shards = shard.execConfig.shards;

      if (shards.length > 0) {
        this.root.handleTx(shards[0].tx);
      }
    });

    this.status = 'closed';
  }

  finishOmitted() {
    this.status = 'closed';
    // todo reolve
    this.shards.forEach((shard) => {
      const execConfig = shard.execConfig;
      const omittedShards = execConfig.omittedShards;

      const position = omittedShards.indexOf(shard);

      omittedShards.splice(position, 1);
    });
  }
}
