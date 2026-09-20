import {AreaCtx, GlobalCtx} from '../ctx/global.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {DomPointer} from '../types.ts';

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointer;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentName: string;
  // globalClientCtx: GlobalClientCtx;
  areaCtx: AreaCtx;
  parentSegmentEnt?: SegmentEnt;
};

export type HydrateResult = {
  hNode: HNode;
  nodeCount: number;
};
