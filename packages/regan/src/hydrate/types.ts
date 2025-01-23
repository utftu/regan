import {PromiseControls} from 'utftu';
import {JsxNode} from '../node/node.ts';
import {GlobalClientCtx, HNode} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt} from '../context/context.tsx';
import {InsertedInfo} from '../utils/inserted-dom.ts';
import {DomPointerWithText} from '../types.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-atoms-snapshot.ts';

export type HydrateCtx = {
  treeAtomsSnapshot: TreeAtomsSnapshot;
};

export type ParentWait = {
  promise: Promise<InsertedInfo>;
  promiseControls: PromiseControls<InsertedInfo>;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointerWithText;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentName: string;
  hydrateCtx: HydrateCtx;
  globalClientCtx: GlobalClientCtx;
  parentWait: ParentWait;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt?: ContextEnt;
};

export type HydrateResult = Promise<{
  hNode: HNode;
}>;
