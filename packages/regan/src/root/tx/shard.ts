import {Atom} from 'strangelove';
import {Tx} from './tx.ts';

// export class ExecConfig {
//   shards: TxShard[] = [];
//   // omittedShards: TxShard[] = [];
//   omittedCount = 0;
// }

export class TxShard {
  tx: Tx;
  atom: Atom;

  constructor(tx: Tx, atom: Atom) {
    this.tx = tx;
    this.atom = atom;
  }
}
