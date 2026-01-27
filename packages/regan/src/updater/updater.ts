import {Atom} from 'strangelove';
import {AnyFunc} from '../types.ts';

type Ent = {
  funcs: AnyFunc[];
  subscriber: AnyFunc;
};

type UpdaterTask = {
  add: (func: AnyFunc) => void;
};

class UpdaterTaskSync {
  add(func: AnyFunc) {
    func();
  }
}

class UpdaterTaskAsync {
  collection = new Set<AnyFunc>();
  started = false;
  timer?: ReturnType<typeof setTimeout>;

  add(func: AnyFunc) {
    this.collection.add(func);

    if (!this.started) {
      this.started = true;
      this.timer = setTimeout(() => {
        this.collection.forEach((func) => func());
        this.started = false;
        this.collection.clear();
        this.timer = undefined;
      });
    }
  }

  cancel() {
    this.started = false;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.collection.clear();
  }
}

export class Updater<TUpdaterTask extends UpdaterTask = any> {
  constructor(updaterTask: TUpdaterTask) {
    this.updaterTask = updaterTask;
  }

  collection = new Map<Atom, Ent>();
  updaterTask: TUpdaterTask;

  add(atom: Atom, func: AnyFunc) {
    if (!this.collection.has(atom)) {
      const subscriber = () => {
        this.collection.get(atom)!.funcs.forEach((func) => {
          this.updaterTask.add(func);
        });
      };
      atom.listeners.subscribe(subscriber);
      this.collection.set(atom, {
        funcs: [func],
        subscriber,
      });

      return;
    }
    this.collection.get(atom)!.funcs.push(func);
  }

  remove(atom: Atom, func: AnyFunc) {
    if (!this.collection.has(atom)) {
      return;
    }

    const ent = this.collection.get(atom)!;

    const newFuncs = ent.funcs.filter((localFunc) => localFunc !== func);

    if (newFuncs.length === 0) {
      atom.listeners.unsubscribe(ent.subscriber);
      this.collection.delete(atom);
      return;
    }

    ent.funcs = newFuncs;
  }

  cancel() {
    this.collection.forEach((ent, atom) => {
      atom.listeners.unsubscribe(ent.subscriber);
    });
    this.collection.clear();
  }
}

export const createUpdaterAsync = () => new Updater(new UpdaterTaskAsync());
export const createUpdaterSync = () => new Updater(new UpdaterTaskSync());
