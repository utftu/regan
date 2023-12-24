import {Atom, Updater, UpdaterConfig} from 'strangelove';
import {createControlledPromise, PromiseControls} from 'utftu';

function runOnPromise<TValue>(
  maybePromise: Promise<TValue> | TValue,
  cb: (value: TValue) => void
) {
  if (maybePromise instanceof Promise) {
    maybePromise.then(cb);
  } else {
    cb(maybePromise);
  }
}

type FastAtom = Atom & {transaction?: TransactionKey};

type PromiseResult = {
  startTime: number;
  finishTime: number;
};

type TransactionKey = {
  startTime: number;
};

type TransactionValue = {
  promise: Promise<PromiseResult>;
  promiseControls: PromiseControls<PromiseResult>;
  startTime: number;
  finishTime: number | null;
  updateCount: number;
  data: any;
  initiator: Atom;
};

export class FastUpdater implements Updater {
  static new() {
    return new FastUpdater();
  }
  private transactions = new WeakMap<TransactionKey, TransactionValue>();
  update(atom: FastAtom, config: UpdaterConfig = {data: null}) {
    const [promise, promiseControls] = createControlledPromise<PromiseResult>();
    const startTime = Date.now();

    const transactionValue = {
      promise,
      promiseControls,
      updateCount: 0,
      startTime: Date.now(),
      finishTime: null,
      data: config.data,
      initiator: atom,
    };

    const transactionKey = {
      startTime,
    };

    this.transactions.set(transactionKey, transactionValue);

    this.updateSelect(atom, transactionKey, null);

    return {
      startTime: transactionValue.startTime,
      finishTime: transactionValue.finishTime,
      promise: transactionValue.promise,
    };
  }
  private checkAtomTransaction(atom: FastAtom, transaction: TransactionKey) {
    if (atom.transaction === transaction) {
      return false;
    }
    if (atom.transaction?.startTime > transaction.startTime) {
      return false;
    }
    return true;
  }
  private startTransasctionOnAtom(atom: FastAtom, transaction: TransactionKey) {
    atom.transaction = transaction;
    const fullTransaction = this.transactions.get(
      transaction
    ) as TransactionValue;
    fullTransaction.updateCount++;
  }
  private finishTransactionOnAtom(transaction: TransactionKey) {
    const fullTransaction = this.transactions.get(
      transaction
    ) as TransactionValue;
    fullTransaction.updateCount--;

    this.checkAndFinishTransaction(transaction);
  }
  private checkAndFinishTransaction(transaction: TransactionKey) {
    const transactionValue = this.transactions.get(
      transaction
    ) as TransactionValue;

    if (transactionValue.updateCount === 0) {
      transactionValue.finishTime = Date.now();
      transactionValue.promiseControls.resolve({
        startTime: transactionValue.startTime,
        finishTime: Date.now(),
      });
    }
  }

  private updateSelect(
    atom: FastAtom,
    transaction: TransactionKey,
    parent: FastAtom | null
  ) {
    if (this.checkAtomTransaction(atom, transaction) === false) {
      this.checkAndFinishTransaction(transaction);
      return;
    }
    this.startTransasctionOnAtom(atom, transaction);

    const transactionValue = this.transactions.get(
      transaction
    ) as TransactionValue;
    runOnPromise(
      atom.exec(atom, {
        data: transactionValue.data,
        initiator: transactionValue.initiator,
        parent,
      }),
      (execResult) => {
        if (execResult === false) {
          this.finishTransactionOnAtom(transaction);
          return;
        }

        atom.listeners.trigger(atom);
        // this.delayedCalls.add(atom, () => atom.listeners.trigger(atom));

        this.updateChildren(atom, transaction);
        this.finishTransactionOnAtom(transaction);
      }
    );
  }
  private updateChildren(atom: FastAtom, transaction: TransactionKey) {
    for (const childAtom of [...atom.relations.children]) {
      this.updateSelect(childAtom as FastAtom, transaction, atom);
    }
  }
}
