import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../../h-node/h-node.ts';
import {JsxSegment, ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';

export type AddElementToParent = (elem: HTMLElement | string) => void;

export type RenderCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type RenderProps = {
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
};
