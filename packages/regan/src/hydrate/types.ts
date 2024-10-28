import {Atom} from 'strangelove';
import {PromiseControls} from 'utftu';
import {JsxNode} from '../node/node.ts';
import {DomPointerElement} from '../types.ts';
import {GlobalClientCtx, HNode} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';

export type HCtx = {
  changedAtoms: Set<Atom>;
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
  domPointer: DomPointerElement;
  parentHNode?: HNode;
  // parentCtx?: Ctx;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  // parentJsxSegment?: ParentJsxSegment;
  hCtx: HCtx;
  globalClientCtx: GlobalClientCtx;
  parentWait: ParentWait;
  atomDescendant: boolean;
  atomDirectNode: boolean;
};

export type HydrateResult = Promise<{
  hNode: HNode;
  // hNode: HNode;
}>;
