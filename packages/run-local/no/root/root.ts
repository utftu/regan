import {AtomsStore} from './atoms-store/atoms-store.ts';
import {Changes, Tx} from './tx/tx.ts';

const OMITTED_LIMIT = 10;
export type Action = () => void;

export class Root {
  atomsStore: AtomsStore;

  constructor() {
    this.atomsStore = new AtomsStore(this);
  }

  // not check prev
  handleTx(tx: Tx) {
    if (tx.status === 'init' && this.checkOmmit(tx)) {
      this.omit(tx);
      return;
    }

    if (tx.status === 'init' && this.checkExec(tx)) {
      this.exec(tx);
      return;
    }

    // do nothing
  }

  addTx(changes: Changes) {
    const tx = new Tx({changes, root: this});

    // doubtfull but ok
    queueMicrotask(() => {
      this.handleTx(tx);
    });

    return tx.promise;
  }

  // Если превышен лимит пропусков то не пропускаем
  // Если хотя бы в одном месте последний - не пропускаем
  // Если везде последний пропускаем
  // Если особый флаг - не пропускаем (используется для atom wrapper, чтобы остановиться обновления дочерних atom-wrapper)
  checkOmmit(tx: Tx) {
    if (tx.omitResist === true) {
      return false;
    }

    for (const shard of tx.shards) {
      const linkConfig = this.atomsStore.get(shard.atom)!;
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

  // Удаляем элемент
  // Если элемент был не последним, запустить обработку следующего
  omit(tx: Tx) {
    tx.status = 'omitted';
    const positions = [];
    for (const shard of tx.shards) {
      const linkConfig = this.atomsStore.get(shard.atom)!;
      const atomConfigShards = linkConfig.shards;

      const position = atomConfigShards.indexOf(shard);
      positions.push(position);

      atomConfigShards.splice(position, 1);
      linkConfig.omittedShards.push(shard);
    }

    for (let i = 0; i < tx.shards.length; i++) {
      const shard = tx.shards[i];
      const linkConfig = this.atomsStore.get(shard.atom)!;

      const atomConfigShards = linkConfig.shards;
      const nextShard = atomConfigShards[positions[i]];

      if (nextShard) {
        nextShard.tx.root.handleTx(nextShard.tx);
      }
    }
  }

  checkExec(tx: Tx) {
    for (const shard of tx.shards) {
      const linkConfig = this.atomsStore.get(shard.atom)!;
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

      if (!this.atomsStore.check(atom)) {
        continue;
      }

      const execsForAtom = this.atomsStore.get(atom)!;

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
      const linkConfig = this.atomsStore.get(shard.atom)!;
      linkConfig.shards.splice(0, 1);
    });

    tx.finish();

    tx.shards.forEach((shard) => {
      const linkConfig = this.atomsStore.get(shard.atom)!;
      linkConfig.omittedShards.forEach((shard) => {
        this.finishOmitted(shard.tx);
      });

      const shards = linkConfig.shards;

      if (shards.length > 0) {
        this.handleTx(shards[0].tx);
      }

      linkConfig.omittedShards = [];
    });

    tx.status = 'closed';
  }

  finishOmitted(tx: Tx) {
    tx.status = 'closed';
    tx.finish();
  }
}
