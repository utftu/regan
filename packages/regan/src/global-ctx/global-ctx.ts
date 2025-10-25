import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {Root} from '../root/root.ts';
import {DomPointer} from '../types.ts';
import {createUpdaterAsync, createUpdaterSync} from '../updater/updater.ts';

type Data = Record<any, any>;

type Mode = 'server' | 'client';

export class AreaCtx {
  updaterInit = createUpdaterSync();
}

export class GlobalCtx {
  data: Data;
  root: Root;
  mode: Mode;
  updater = createUpdaterAsync();
  updaterInit = createUpdaterSync();
  globalClientCtx?: GlobalClientCtx;
  constructor({data = {}, root, mode}: {data?: Data; root: Root; mode: Mode}) {
    this.data = data;
    this.root = root;
    this.mode = mode;
  }
}

export class GlobalClientCtx {
  initDomPointer: DomPointer;
  window: Window;
  // atomsTracker?: AtomsTracker;

  constructor({
    window: localWindow,
    initDomPointer,
  }: {
    initDomPointer: DomPointer;
    window: Window;
  }) {
    this.initDomPointer = initDomPointer;
    this.window = localWindow;
  }
}
