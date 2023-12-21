import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {JsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';

export type StringContext = {
  snapshot: TreeAtomsSnapshot;
};

export type GetStringStreamProps = {
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: JsxSegment;
  stringContext: StringContext;
};
