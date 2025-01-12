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
}
