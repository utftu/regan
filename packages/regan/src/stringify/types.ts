import {AreaCtx, GlobalCtxServer} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type StringifyCtx = {
  globalCtx: GlobalCtxServer;
  areaCtx: AreaCtx;
};

export type StringifyProps = {
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  stringifyCtx: StringifyCtx;
};

export type StringifyResult = {
  text: string;
};
