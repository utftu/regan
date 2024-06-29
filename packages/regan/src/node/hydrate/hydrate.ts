import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNode, HNodeBase, HNodeCtx} from '../../h-node/h-node.ts';
import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {DomPointer} from '../../types.ts';
import {PromiseControls} from 'utftu';
import {JsxNode} from '../node.ts';

export type HCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type DomNodesInfo = {
  elemsCount: number;
  textLength: number;
};

export type ParentWait = {
  promise: Promise<DomNodesInfo>;
  promiseControls: PromiseControls<DomNodesInfo>;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointer;
  parentHNode?: HNode;
  parentCtx?: Ctx;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  parentWait: ParentWait;
  // insertedDomNodes: InsertedDomNodes;
  atomDescendant: boolean;
  atomDirectNode: boolean;
};

export type HydrateResult = Promise<{
  hNode: HNode;
}>;
