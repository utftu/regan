import {Root} from '../root/root.ts';

type Stage = 'string' | 'hydrate' | 'render' | 'idle';

type Data = Record<any, any>;

export class GlobalCtx {
  window: Window;
  stage: Stage;
  data: Data;
  root: Root;
  constructor({
    window,
    stage: status,
    data = {},
    root,
  }: {
    window: Window;
    stage: Stage;
    data?: Data;
    root: Root;
  }) {
    this.window = window;
    this.stage = status;
    this.data = data;
    this.root = root;
  }
}
