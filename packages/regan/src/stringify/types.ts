import {ContextEnt} from '../context/context.tsx';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type StringifyContext = {};

export type StringifyProps = {
  globalCtx: GlobalCtx;
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  stringifyContext: StringifyContext;
  areaCtx: AreaCtx;
};

export type StringifyResult = {
  text: string;
};
