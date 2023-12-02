import {Atom} from 'strangelove';
import {createControlledPromise, PromiseControls} from 'utftu';

class InternalAtomConfig {
  shards: TxShard[] = [];
  omittedShards: TxShard[] = [];
}

const OMITTED_LIMIT = 10;

type Changes = Map<Atom, any>;
type Exec = () => Promise<() => void>;

const TxStatuses = {
  init: 0,
  running: 1,
  finished: 2,
  closed: 3,
};

class Tx {
  // changes: Map<Atom, any> = new Map();
  exec: Exec;
  execReault?: () => void;
  shards: TxShard[] = [];
  root: Root;
  promise: Promise<any>;
  promiseControls: PromiseControls<any>;

  constructor(exec: Exec, root: Root) {
    this.exec = exec;
    this.root = root;
    const [promise, promiseControls] = createControlledPromise<any>();
    this.promise = promise;
    this.promiseControls = promiseControls;
  }

  status: 'init' | 'running' | 'finished' | 'closed' = 'init';

  checkOmmit() {
    for (const shard of this.shards) {
      if (shard.internalAtomConfig.omittedShards.length > OMITTED_LIMIT) {
        return false;
      }
      const atomConfigShards = shard.internalAtomConfig.shards;

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
      const atomConfigShards = shard.internalAtomConfig.shards;

      const position = atomConfigShards.indexOf(shard);
      positions.push(position);

      atomConfigShards.splice(position, 1);
      shard.internalAtomConfig.omittedShards.push(shard);
    }

    for (let i = 0; i <= this.shards.length; i++) {
      const shard = this.shards[i];

      const atomConfigShards = shard.internalAtomConfig.shards;
      const nextShard = atomConfigShards[positions[i]];

      if (nextShard) {
        nextShard.tx.root.handleTx(nextShard.tx);
      }
    }
  }

  checkReadyRun() {
    for (const shard of this.shards) {
      const atomConfigShards = shard.internalAtomConfig.shards;

      if (atomConfigShards[0] !== shard) {
        return false;
      }
    }

    return true;
  }
}

class TxShard {
  static chechSignals = {
    single: 0,
    canBeOmitted: 1,
    last: 2,
  };

  tx: Tx;
  internalAtomConfig: InternalAtomConfig;

  constructor(tx: Tx, internalAtomConfig: InternalAtomConfig) {
    this.tx = tx;
    tx.shards.push(this);
    this.internalAtomConfig = internalAtomConfig;
  }
}

class Links {
  links: Map<Atom, Atom[]> = new Map();

  addLink(externalAtom: Atom, internalAtom: Atom) {
    if (!this.links.has(externalAtom)) {
      this.links.set(externalAtom, [internalAtom]);
    } else {
      this.links.get(externalAtom)!.push(externalAtom);
    }
  }

  removeLink(externalAtom: Atom, internalAtom: Atom) {
    if (!this.links.has(externalAtom)) {
      return;
    }
    const newInternalAtoms = this.links
      .get(externalAtom)!
      .filter((localInternalAtom) => internalAtom !== localInternalAtom);

    if (newInternalAtoms.length === 0) {
      this.links.delete(externalAtom);
    } else {
      this.links.set(externalAtom, newInternalAtoms);
    }
  }
}

class Root {
  links = new Links();
  internalAtoms: Map<Atom, InternalAtomConfig> = new Map();

  // not check prev
  handleTx(tx: Tx) {
    // 1
    if (tx.status === 'running') {
      return;
    }

    // 2
    if (tx.status === 'finished') {
      // гарантировано что вырезанная транзакция будет первой
      tx.status = 'closed';
      tx.shards.forEach((shard) => {
        shard.internalAtomConfig.shards.splice(0, 1);
      });
      tx.shards.forEach((shard) => {
        const txs = shard.internalAtomConfig.shards;
        if (txs.length > 0) {
          this.handleTx(txs[0].tx);
        }
      });
      return;
    }

    if (tx.checkOmmit()) {
      tx.omit();
      return;
    }

    if (tx.checkReadyRun()) {
      tx.status = 'running';
      tx.exec().then((result) => {
        tx.execReault = result;
        tx.status = 'finished';
        tx.root.handleTx(tx);
      });
    }

    if (tx.status === 'init') {
      for (let i = 0; i < tx.shards.length; i++) {
        const shard = tx.shards[i];
        const internalAtomConfig = shard.internalAtomConfig;
        const atomConfigShards = internalAtomConfig.shards;

        const position = tx.shards.indexOf(shard);

        // if ()

        for (let j = 0; j < atomConfigShards.length; j++) {
          const atomConfigShard = atomConfigShards[j];

          if (atomConfigShard === shard) {
          }

          const canOmit = atomConfigShard.tx.checkOmmit();

          if (canOmit) {
            atomConfigShard.tx.omit();
          }
        }
      }
      // // 3
      // for (const shard of tx.shards) {
      //   const tsx = shard.internalAtomConfig.shards;

      //   if (tsx[tsx.length - 1] === shard) {
      //     continue;
      //   }

      //   if (tsx[tsx.length - 1] !== shard) {
      //     if (shard.internalAtomConfig.shards.length !== 1) {
      //       return;
      //     }
      //   }
      // }
    }
  }

  // addTx(tx: Tx) {
  //   let emptyAtoms = true;

  //   for (const [externalAtom, value] of tx.changes.entries()) {
  //     if (!this.links.has(externalAtom)) {
  //       return;
  //     }

  //     const internalAtoms = this.links.get(externalAtom) ?? [];

  //     for (const internalAtom of internalAtoms) {
  //       // check exist
  //       let internalAtomConfig: InternalAtomConfig;
  //       if (!this.internalAtoms.has(internalAtom)) {
  //         internalAtomConfig = new InternalAtomConfig();
  //         this.internalAtoms.set(internalAtom, internalAtomConfig);
  //       } else {
  //         internalAtomConfig = this.internalAtoms.get(internalAtom)!;
  //       }

  //       if (internalAtomConfig.transactions.length !== 0) {
  //         emptyAtoms = false;
  //       }

  //       const position = internalAtomConfig.shards.length;
  //       internalAtomConfig.transactions.push(
  //         new TxShard(tx, internalAtom, position)
  //       );
  //     }
  //   }

  //   //   if (emptyAtoms === true) {
  //   //   }
  //   // }
  // }
}
