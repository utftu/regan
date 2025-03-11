import {ContextEnt} from '../context/context.tsx';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

export type StringifyContext = {};

export type StringifyProps = {
  globalCtx: GlobalCtx;
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  stringifyContext: StringifyContext;
};

export type StringifyResult = {
  text: string;
};
