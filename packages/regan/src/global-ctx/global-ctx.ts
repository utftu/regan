import {Root} from '../root/root.ts';

type Stage = 'string' | 'hydrate' | 'render' | 'idle';
type Mode = 'server' | 'client';

type Data = Record<any, any>;

export class GlobalCtx {
  // window: Window;
  // stage: Stage;
  data: Data;
  root: Root;
  mode: Mode;
  constructor({
    // window,
    // stage: status,
    data = {},
    root,
    mode,
  }: {
    // window: Window;
    // stage: Stage;
    data?: Data;
    root: Root;
    mode: Mode;
  }) {
    // this.window = window;
    // this.stage = status;
    this.data = data;
    this.root = root;
    this.mode = mode;
  }
}
