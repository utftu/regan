import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../../h-node/h-node.ts';
import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {DomPointer} from '../../types.ts';
import {InsertedDomNodes} from '../../utils/inserted-dom.ts';

export type HCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type HydrateProps = {
  // dom: DomProps;
  domPointer: DomPointer;
  parentHNode?: HNode;
  parentCtx?: Ctx;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
};

export type HydrateResult = Promise<{
  insertedDomNodes: InsertedDomNodes;
  hNode: HNode;
}>;
