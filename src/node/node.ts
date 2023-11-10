import {Props} from '../types.ts';
import {HydratedNode} from './hydrate/hydrate.ts';
import {Atom, disconnectAtoms} from 'strangelove';
import {GlobalCtx} from './global-ctx/global-ctx.ts';

// start

type JSXChild =
  | JSXNode
  | string
  | null
  | undefined
  | Atom
  | ((...args: any[]) => any);
type CtxChildren = JSXChild[];

type FC = () => JSXChild | JSXChild[] | Promise<JSXChild> | Promise<JSXChild[]>;

// finish

export type Child = JSXNode<any, any> | string | null | undefined;

export type DomSimpleProps = {
  parent: HTMLElement;
};

export type DomProps = DomSimpleProps & {
  position: number;
};

export type GetStringStreamProps = {
  gloablCtx: GlobalCtx;
};

export type HydrateProps = {
  dom: DomProps;
  parentHydratedNode?: HydratedNode;
  globalCtx: GlobalCtx;
};

export type RenderProps = {
  dom: {parent: HTMLElement};
  parentHydratedNode?: HydratedNode;
  globalCtx: GlobalCtx;
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
  ): Promise<{insertedCount: number; hydratedNode: HydratedNode}>;
  abstract render(ctx: RenderProps): Promise<{hydratedNode: HydratedNode}>;
}

export function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}
