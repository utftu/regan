import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderNode} from './node.ts';

export type RenderCtx = {
  globalCtx: GlobalCtx;
  areaCtx: AreaCtx;
};

export type RenderProps = {
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  renderCtx: RenderCtx;
};

export type RenderResult = {
  renderNode: RenderNode;
};
