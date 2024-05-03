import {PromiseControls, createControlledPromise} from 'utftu';
import {Action} from '../root.ts';
import {Exec} from '../links/links.ts';

export class Planner {
  plans: Map<Exec, Action> = new Map();

  status: 'idle' | 'running' = 'idle';

  constructor() {
    const [promise, controls] = createControlledPromise<void>();

    this.promise = promise;
    this.promiseControls = controls;
  }

  promise: Promise<void>;
  promiseControls: PromiseControls<void>;

  plan(exec: Exec, action: Action) {
    this.plans.set(exec, action);

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
