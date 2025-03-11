import {ContextEnt} from '../context/context.tsx';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';

type StringifyContext = {};

export type StringifyProps = {
  globalCtx: GlobalCtx;
  pathSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt?: ContextEnt;
  stringifyContext: StringifyContext;
};
