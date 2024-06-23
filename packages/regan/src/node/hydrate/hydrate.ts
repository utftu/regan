import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNodeBase, HNodeCtx} from '../../h-node/h-node.ts';
import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {DomPointer} from '../../types.ts';
import {InsertedDomNodes} from '../../utils/inserted-dom.ts';
import {PromiseControls} from 'utftu';
import {JsxNode} from '../node.ts';

export type HCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type InsertedDomNodesPromise = {
  promise: Promise<InsertedDomNodes>;
  promiseControls: PromiseControls<InsertedDomNodes>;
};

export type HydrateProps = {
  parent?: JsxNode;
  domPointer: DomPointer;
  parentHNode?: HNodeBase;
  parentCtx?: Ctx;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  insertedDomNodesPromise: InsertedDomNodesPromise;
  atomDescendant: boolean;
  atomDirectNode: boolean;
};

export type HydrateResult = Promise<{
  insertedDomNodes: InsertedDomNodes;
  hNode: HNodeBase;
}>;
