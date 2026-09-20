import {defaultData} from '../consts.ts';
import {GlobalErrorHandler} from '../errors/helpers.ts';
import {Data, InsertPoint} from '../types.ts';
import {createUpdaterAsync, createUpdaterSync} from '../updater/updater.ts';

export class AreaCtx {
  updaterInit = createUpdaterSync();
}

export class GlobalCtx<
  TClientCtx extends GlobalClientCtx | undefined = GlobalClientCtx,
> {
  data: Data;
  updater = createUpdaterAsync();
  errorHandlers: GlobalErrorHandler[];
  clientCtx: TClientCtx;
  constructor({
    data = defaultData,
    clientCtx,
    errorHandlers = [],
  }: {
    data?: Data;
    clientCtx: TClientCtx;
    errorHandlers?: GlobalErrorHandler[];
  }) {
    this.data = data;
    this.clientCtx = clientCtx;
    this.errorHandlers = errorHandlers;
  }
}

export type GlobalCtxServer = GlobalCtx<undefined>;
export type GlobalCtxBoth = GlobalCtx<GlobalClientCtx | undefined>;

export class GlobalClientCtx {
  initInsertPoint: InsertPoint;
  window: Window;

  constructor({
    window: localWindow,
    initInsertPoint,
  }: {
    initInsertPoint: InsertPoint;
    window: Window;
  }) {
    this.initInsertPoint = initInsertPoint;
    this.window = localWindow;
  }
}
