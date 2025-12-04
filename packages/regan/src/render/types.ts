import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderT} from './template.types.ts';

export type RenderCtx = {
  globalCtx: GlobalCtx;
  areaCtx: AreaCtx;
};

export type RenderProps = {
  // globalCtx: GlobalCtx;
  // areaCtx: AreaCtx;
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  renderCtx: RenderCtx;
};

export type RenderResult = {
  renderTemplate: RenderT;
};
