import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {ContextEnt} from '../context/context.tsx';
import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {DomPointer} from '../types.ts';

export type HydrateCtx = {
  atomTracker: AtomsTracker;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointer;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentName: string;
  hydrateCtx: HydrateCtx;
  globalClientCtx: GlobalClientCtx;
  parentSegmentEnt?: SegmentEnt;
};

export type HydrateResult = {
  hNode: HNode;
  nodeCount: number;
};
