import {PromiseControls, createControlledPromise} from 'utftu';
import {Action, Root} from '../root.ts';
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
      const shard = new TxShard(this, atom);
      this.shards.push(shard);
      this.root.links.get(atom)!.shards.push(shard);
    }
  }

  // init => running => finished => closed
  // init => omitted => closed
  status: 'init' | 'omitted' | 'running' | 'finished' | 'closed' = 'init';

  finish() {
    this.promiseControls.resolve();
  }

  // // r
  // checkOmmit() {
  //   for (const shard of this.shards) {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     if (linkConfig.omittedShards.length > OMITTED_LIMIT) {
  //       return false;
  //     }
  //     const atomConfigShards = linkConfig.shards;

  //     const position = atomConfigShards.indexOf(shard);

  //     if (atomConfigShards.length - 1 === position) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // // r
  // omit() {
  //   this.status = 'omitted';
  //   const positions = [];
  //   for (const shard of this.shards) {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     const atomConfigShards = linkConfig.shards;

  //     const position = atomConfigShards.indexOf(shard);
  //     positions.push(position);

  //     atomConfigShards.splice(position, 1);
  //     linkConfig.omittedShards.push(shard);
  //   }

  //   for (let i = 0; i < this.shards.length; i++) {
  //     const shard = this.shards[i];
  //     const linkConfig = this.root.links.get(shard.atom)!;

  //     const atomConfigShards = linkConfig.shards;
  //     const nextShard = atomConfigShards[positions[i]];

  //     if (nextShard) {
  //       nextShard.tx.root.handleTx(nextShard.tx);
  //     }
  //   }
  // }

  // // r
  // checkExec() {
  //   for (const shard of this.shards) {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     const atomConfigShards = linkConfig.shards;

  //     if (atomConfigShards[0] !== shard) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // // r
  // async exec() {
  //   this.status = 'running';

  //   const execResults: Promise<Action>[] = [];

  //   for (const change of this.changes) {
  //     const [atom, value] = change;

  //     if (!this.root.links.check(atom)) {
  //       continue;
  //     }

  //     const execsForAtom = this.root.links.get(atom)!;

  //     execsForAtom.execs.forEach((exec) => {
  //       execResults.push(exec(value));
  //     });
  //   }
  //   await Promise.all(execResults);

  //   this.finish();
  // }

  // // r
  // finish() {
  //   this.status = 'finished';
  //   this.shards.forEach((shard) => {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     linkConfig.shards.splice(0, 1);
  //   });

  //   this.promiseControls.resolve();
  //   this.shards.forEach((shard) => {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     linkConfig.omittedShards.forEach((shard) => {
  //       shard.tx.finishOmitted();
  //     });

  //     const shards = linkConfig.shards;

  //     if (shards.length > 0) {
  //       this.root.handleTx(shards[0].tx);
  //     }
  //   });

  //   this.status = 'closed';
  // }

  // finishOmitted() {
  //   this.status = 'closed';
  //   // todo reolve
  //   this.shards.forEach((shard) => {
  //     const linkConfig = this.root.links.get(shard.atom)!;
  //     const omittedShards = linkConfig.omittedShards;

  //     const position = omittedShards.indexOf(shard);

  //     omittedShards.splice(position, 1);
  //   });
  // }
}
