import {Links} from './links/links.ts';
import {Changes, Tx} from './tx/tx.ts';

const OMITTED_LIMIT = 10;
export type Action = () => void;

export class Root {
  links: Links;

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

    if (tx.status === 'init' && this.checkOmmit(tx)) {
      this.omit(tx);
      return;
    }

    if (tx.status === 'init' && this.checkExec(tx)) {
      this.exec(tx);
      return;
    }
  }

  addTx(changes: Changes) {
    const tx = new Tx(changes, this);

    // doubtfull but ok
    queueMicrotask(() => {
      this.handleTx(tx);
    });

    return tx.promise;
  }

  checkOmmit(tx: Tx) {
    for (const shard of tx.shards) {
      const linkConfig = this.links.get(shard.atom)!;
      if (linkConfig.omittedShards.length > OMITTED_LIMIT) {
        return false;
      }
      const atomConfigShards = linkConfig.shards;

      if (atomConfigShards.at(-1) === shard) {
        return false;
      }
    }
    return true;
  }

  omit(tx: Tx) {
    tx.status = 'omitted';
    const positions = [];
    for (const shard of tx.shards) {
      const linkConfig = this.links.get(shard.atom)!;
      const atomConfigShards = linkConfig.shards;

      const position = atomConfigShards.indexOf(shard);
      positions.push(position);

      atomConfigShards.splice(position, 1);
      linkConfig.omittedShards.push(shard);
    }

    for (let i = 0; i < tx.shards.length; i++) {
      const shard = tx.shards[i];
      const linkConfig = this.links.get(shard.atom)!;

      const atomConfigShards = linkConfig.shards;
      const nextShard = atomConfigShards[positions[i]];

      if (nextShard) {
        nextShard.tx.root.handleTx(nextShard.tx);
      }
    }
  }

  checkExec(tx: Tx) {
    for (const shard of tx.shards) {
      const linkConfig = this.links.get(shard.atom)!;
      const atomConfigShards = linkConfig.shards;

      if (atomConfigShards[0] !== shard) {
        return false;
      }
    }

    return true;
  }

  async exec(tx: Tx) {
    tx.status = 'running';

    const execResults: Promise<Action>[] = [];

    for (const change of tx.changes) {
      const [atom, value] = change;

      if (!this.links.check(atom)) {
        continue;
      }

      const execsForAtom = this.links.get(atom)!;

      execsForAtom.execs.forEach((exec) => {
        execResults.push(exec(value));
      });
    }
    // exec should be awaited
    await Promise.all(execResults);

    this.finish(tx);
  }

  finish(tx: Tx) {
    tx.status = 'finished';
    tx.shards.forEach((shard) => {
      const linkConfig = this.links.get(shard.atom)!;
      linkConfig.shards.splice(0, 1);
    });

    tx.finish();

    tx.shards.forEach((shard) => {
      const linkConfig = this.links.get(shard.atom)!;
      linkConfig.omittedShards.forEach((shard) => {
        this.finishOmitted(shard.tx);
        // shard.tx.finishOmitted();
      });

      const shards = linkConfig.shards;

      if (shards.length > 0) {
        this.handleTx(shards[0].tx);
      }
    });

    tx.status = 'closed';
  }

  finishOmitted(tx: Tx) {
    tx.status = 'closed';
    tx.finish();

    tx.shards.forEach((shard) => {
      const linkConfig = this.links.get(shard.atom)!;
      const omittedShards = linkConfig.omittedShards;

      const position = omittedShards.indexOf(shard);

      omittedShards.splice(position, 1);
    });
  }
}
