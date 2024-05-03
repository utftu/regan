import {PromiseControls, createControlledPromise} from 'utftu';
import {Action} from '../root.ts';
import {Exec as Atom} from '../links/links.ts';

// UNUSED
export class Planner {
  plans: Map<Atom, Action> = new Map();

  status: 'idle' | 'running' = 'idle';

  constructor() {
    const [promise, controls] = createControlledPromise<void>();

    this.promise = promise;
    this.promiseControls = controls;
  }

  promise: Promise<void>;
  promiseControls: PromiseControls<void>;

  plan(atom: Atom, action: Action) {
    this.plans.set(atom, action);

    if (this.status === 'idle') {
      const [promise, controls] = createControlledPromise<void>();
      this.promise = promise;
      this.promiseControls = controls;

      this.status = 'running';
      queueMicrotask(() => {
        this.plans.forEach((action) => {
          action();
        });
        this.plans.clear();
        controls.resolve();
        this.status = 'idle';
      });

      return promise;
    }

    return this.promise;
  }
}
