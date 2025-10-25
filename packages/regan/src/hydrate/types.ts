import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {ContextEnt} from '../context/context.tsx';
import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {DomPointer} from '../types.ts';

export type HydrateCtx = {
  // atomsTracker: AtomsTracker;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointer;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentName: string;
  hydrateCtx: HydrateCtx;
  globalClientCtx: GlobalClientCtx;
  areaCtx: AreaCtx;
  parentSegmentEnt?: SegmentEnt;
  lastText: boolean;
};

export type HydrateResult = {
  hNode: HNode;
  nodeCount: number;
  lastText: boolean;
};
