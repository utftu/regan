import {Atom} from 'strangelove';
import {createControlledPromise, PromiseControls} from 'utftu';

class InternalAtomConfig {
  shards: TxShard[] = [];
  omittedShard: TxShard[] = [];
}

class Tx {
  changes: Map<Atom, any> = new Map();
  shards: TxShard[] = [];
  root: Root;
  promise: Promise<any>;
  promiseControls: PromiseControls<any>;

  constructor(changes: Map<Atom, any>, root: Root) {
    this.changes = changes;
    this.root = root;
    const [promise, promiseControls] = createControlledPromise<any>();
    this.promise = promise;
    this.promiseControls = promiseControls;
  }

  status: 'init' | 'running' | 'finished' | 'closed' = 'init';

  checkOmmit() {
    for (const shard of this.shards) {
      const atomConfigShards = shard.internalAtomConfig.shards;

      const position = atomConfigShards.indexOf(shard);

      if (atomConfigShards[position + 1] === undefined) {
        return false;
      }
    }
    return true;
  }

  // async exec() {
  //   const shardResults = await Promise.all(
  //     this.shards.map((shard) => shard.exec())
  //   );

  //   for (const syncActions of shardResults) {
  //     for (const syncAction of syncActions) {
  //       syncAction();
  //     }
  //   }
  // }
}

class TxShard {
  static chechSignals = {
    single: 0,
    canBeOmitted: 1,
    last: 2,
  };

  tx: Tx;
  internalAtomConfig: InternalAtomConfig;
  position: number;
  // internalAtom: Atom;
  // value: any;

  constructor(
    tx: Tx,
    internalAtomConfig: InternalAtomConfig
    // value: any
  ) {
    this.tx = tx;
    tx.shards.push(this);
    this.internalAtomConfig = internalAtomConfig;
    // this.value = value;
  }

  // async exec() {
  //   const funcs: (() => void)[] = [];
  //   await this.internalAtom.update({
  //     data: {
  //       syncActions: funcs,
  //     },
  //   });
  //   return funcs;
  // }

  // check() {
  //   // todo check not exist

  //   if (!this.tx.root.internalAtoms.has(this.internalAtom)) {
  //     return true;
  //   }

  //   const internalAtomConfig = this.tx.root.internalAtoms.get(
  //     this.internalAtom
  //   )!;

  //   if (internalAtomConfig.transactions.length === 0) {
  //     return true;
  //   }

  //   // if (ex)
  // }
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
  // links: Map<Atom, Atom[]> = new Map();
  internalAtoms: Map<Atom, InternalAtomConfig> = new Map();

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

  checkTx(tx: Tx) {
    // 1
    if (tx.status === 'running') {
      return;
    }

    // 2
    if (tx.status === 'finished') {
      tx.shards.forEach((shard) => {
        shard.internalAtomConfig.shards.splice(0, 1);
      });
      tx.shards.forEach((shard) => {
        const txs = shard.internalAtomConfig.shards;
        if (txs.length > 0) {
          this.checkTx(txs[0].tx);
        }
      });
    }

    if (tx.status === 'init') {
      for (let i = 0; i < tx.shards.length; i++) {
        const shard = tx.shards[i];
        const internalAtomConfig = shard.internalAtomConfig;
        const atomConfigShards = internalAtomConfig.shards;

        for (let j = 0; j < atomConfigShards.length; j++) {
          const atomConfigShard = atomConfigShards[j];

          // if ()
        }

        // if (shard.)

        // for (co)

        // if (tsx.at(-1) === shard) {
        //   continue;
        // }

        // if (0) {

        // }
      }
      // 3
      for (const shard of tx.shards) {
        const tsx = shard.internalAtomConfig.shards;
        if (tsx[tsx.length - 1] === shard) {
          continue;
        }

        // const position

        if (tsx[tsx.length - 1] !== shard) {
          if (shard.internalAtomConfig.shards.length !== 1) {
            return;
          }
        }
      }
    }

    for (const shard of tx.shards) {
    }
  }

  addTx(tx: Tx) {
    let emptyAtoms = true;

    for (const [externalAtom, value] of tx.changes.entries()) {
      if (!this.links.has(externalAtom)) {
        return;
      }

      const internalAtoms = this.links.get(externalAtom) ?? [];

      for (const internalAtom of internalAtoms) {
        // check exist
        let internalAtomConfig: InternalAtomConfig;
        if (!this.internalAtoms.has(internalAtom)) {
          internalAtomConfig = new InternalAtomConfig();
          this.internalAtoms.set(internalAtom, internalAtomConfig);
        } else {
          internalAtomConfig = this.internalAtoms.get(internalAtom)!;
        }

        if (internalAtomConfig.transactions.length !== 0) {
          emptyAtoms = false;
        }

        const position = internalAtomConfig.shards.length;
        internalAtomConfig.transactions.push(
          new TxShard(tx, internalAtom, position)
        );
      }
    }

    //   if (emptyAtoms === true) {
    //   }
    // }
  }
}
