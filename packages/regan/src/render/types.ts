import {ContextEnt} from '../context/context.tsx';
import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderTemplate} from './template.types.ts';

export type RenderCtx = {};

export type RenderProps = {
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  renderCtx: RenderCtx;
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt: ContextEnt;
};

export type RenderResult = {
  renderTemplate: RenderTemplate;
};
