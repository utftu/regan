import {Atom} from 'strangelove';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {HNodeBase, HNodeCtx} from '../../h-node/h-node.ts';
import {ParentJsxSegment} from '../../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {DomPointer} from '../../types.ts';

type ConnectElements = () => (HTMLElement | string)[];

export type AddElementToParent = (elem: HTMLElement | string) => void;

export type RenderCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type RenderProps = {
  parentHNode?: HNodeBase;
  parentDomPointer: DomPointer;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: ParentJsxSegment;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
};

export type RenderResult = Promise<{
  hNode: HNodeBase;
  insertedDomCount: number;
  connectElements: ConnectElements;
}>;
