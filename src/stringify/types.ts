import {AreaCtx, GlobalCtxServer} from '../ctx/global.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type StringifyCtx = {
  globalCtx: GlobalCtxServer;
  areaCtx: AreaCtx;
};

export type StringifyProps = {
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  stringifyCtx: StringifyCtx;
  lastText: boolean;
};

export type StringifyResult = {
  text: string;
  lastText: boolean;
};
