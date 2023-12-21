import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNode} from '../../h-node/h-node.ts';
import {JsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';

export type AddElementToParent = (elem: HTMLElement | string) => void;

export type RenderCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type RenderProps = {
  dom: {parent: HTMLElement};
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: JsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
};
