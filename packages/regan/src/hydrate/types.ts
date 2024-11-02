import {Atom} from 'strangelove';
import {PromiseControls} from 'utftu';
import {JsxNode} from '../node/node.ts';
import {DomPointerElement} from '../types.ts';
import {GlobalClientCtx, HNode} from '../h-node/h-node.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt} from '../context/context.tsx';
import {InsertedInfo} from '../utils/inserted-dom.ts';

export type HydrateCtx = {
  changedAtoms: Set<Atom>;
};

export type ParentWait = {
  promise: Promise<InsertedInfo>;
  promiseControls: PromiseControls<InsertedInfo>;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointerElement;
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentName: string;
  hydrateCtx: HydrateCtx;
  globalClientCtx: GlobalClientCtx;
  parentWait: ParentWait;
  parentSegmentEnt: SegmentEnt;
  parentContextEnt: ContextEnt;
  textLength: number;
};

export type HydrateResult = Promise<{
  hNode: HNode;
  // hNode: HNode;
}>;
