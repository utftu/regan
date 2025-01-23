import {Ctx} from '../../ctx/ctx.ts';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
// import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-atoms-snapshot.ts';
import {JsxNode} from '../node.ts';

export type StringContext = {
  snapshot: TreeAtomsSnapshot;
};

export type GetStringStreamProps = {
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  // parentJsxSegment?: ParentJsxSegment;
  parentCtx?: Ctx;
  parentJsxNode?: JsxNode;
  stringContext: StringContext;
};
