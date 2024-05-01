import {Tx} from './tx.ts';

export class ExecConfig {
  shards: TxShard[] = [];
  omittedShards: TxShard[] = [];
}

export class TxShard {
  tx: Tx;
  execConfig: ExecConfig;

  constructor(tx: Tx, execConfig: ExecConfig) {
    this.tx = tx;
    tx.shards.push(this);
    execConfig.shards.push(this);
    this.execConfig = execConfig;
  }
}
