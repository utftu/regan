import {AreaCtx, GlobalCtxServer} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type StringifyProps = {
  globalCtx: GlobalCtxServer;
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  areaCtx: AreaCtx;
};

export type StringifyResult = {
  text: string;
};
