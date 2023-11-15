import {Child, Props} from '../types.ts';
import {Atom, disconnectAtoms} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../hydrate/h-node.ts';

export type DomSimpleProps = {
  parent: HTMLElement;
};

export type DomProps = DomSimpleProps & {
  position: number;
};

export type GetStringStreamProps = {
  globalCtx: GlobalCtx;
  jsxPath: string;
};

export type HydrateProps = {
  dom: DomProps;
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxPath: string;
};

export type RenderProps = {
  dom: {parent: HTMLElement};
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxPath: string;
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
  ): Promise<{insertedCount: number; hydratedNode: HNode}>;
  abstract render(ctx: RenderProps): Promise<{hydratedNode: HNode}>;
}

export function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}
