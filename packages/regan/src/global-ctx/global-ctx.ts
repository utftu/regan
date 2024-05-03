import {Root} from '../root/root.ts';

type Stage = 'string' | 'hydrate' | 'render' | 'idle';
type Mode = 'server' | 'client';

type Data = Record<any, any>;

export class GlobalCtx {
  data: Data;
  root: Root;
  mode: Mode;
  constructor({data = {}, root, mode}: {data?: Data; root: Root; mode: Mode}) {
    this.data = data;
    this.root = root;
    this.mode = mode;
  }
}
