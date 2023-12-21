import {Child, Props} from '../types.ts';
import {Atom, disconnectAtoms} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';

export type DomSimpleProps = {
  parent: HTMLElement;
};

export type DomProps = DomSimpleProps & {
  position: number;
};

export type StringContext = {
  snapshot: TreeAtomsSnapshot;
};

export type GetStringStreamProps = {
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: JsxSegment;
  stringContext: StringContext;
};

export type HContext = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type HydrateProps = {
  dom: DomProps;
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxSegmentStr: string;
  parentJsxSegment?: JsxSegment;
  hContext: HContext;
};

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

export abstract class JSXNode<TType = any, TProps extends Props = any> {
  type: TType;
  key: string;
  props: TProps;
  children: Child[];

  constructor({
    type,
    props,
    key = '',
    children,
  }: {
    type: TType;
    props: TProps;
    key: string;
    children: Child[];
  }) {
    this.type = type;
    this.key = key;
    this.props = props;
    this.children = children;
  }
  abstract getStringStream(
    ctx: GetStringStreamProps
  ): Promise<ReadableStream<string>>;
  abstract hydrate(
    ctx: HydrateProps
  ): Promise<{insertedCount: number; hNode: HNode}>;
  abstract render(ctx: RenderProps): Promise<{hNode: HNode}>;
}

export function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}
