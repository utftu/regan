import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {ContextEnt} from '../context/context.tsx';
import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderTemplate} from './template.types.ts';

export type RenderCtx = {
  atomsTracker: AtomsTracker;
};

export type RenderProps = {
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  renderCtx: RenderCtx;
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
};

export type RenderResult = {
  renderTemplate: RenderTemplate;
};
