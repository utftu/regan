import {ErrorProps} from '../errors/errors.tsx';
import {GlobalHandler} from '../errors/helpers.ts';
import {Root} from '../root/root.ts';
import {DomPointer} from '../types.ts';
import {createUpdaterAsync, createUpdaterSync} from '../updater/updater.ts';

type Data = Record<any, any>;

type Mode = 'server' | 'client';

export class AreaCtx {
  updaterInit = createUpdaterSync();
}

export class GlobalCtx<
  TClientCtx extends GlobalClientCtx | undefined = GlobalClientCtx
> {
  data: Data;
  root: Root;
  mode: Mode;
  updater = createUpdaterAsync();
  errorHandlers: GlobalHandler[] = [];
  clientCtx: TClientCtx;
  constructor({
    data = {},
    root,
    mode,
    clientCtx,
  }: {
    data?: Data;
    root: Root;
    mode: Mode;
    clientCtx: TClientCtx;
  }) {
    this.data = data;
    this.root = root;
    this.mode = mode;
    this.clientCtx = clientCtx;
  }
}

export type GlobalCtxServer = GlobalCtx<undefined>;
export type GlobalCtxBoth = GlobalCtx<GlobalClientCtx | undefined>;

export class GlobalClientCtx {
  initDomPointer: DomPointer;
  window: Window;

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
