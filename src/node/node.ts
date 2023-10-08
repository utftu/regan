import {handleChildrenHydrate} from './hydrate/hydrate.ts';
import {handleChildrenString} from './string/string.ts';
import {createElementString} from './string/string.ts';
import {Ctx} from './ctx/ctx.ts';
import {NodeCtx, Props} from '../types.ts';
import {HydratedNode} from './hydrate/hydrate.ts';
import {Atom, disconnectAtoms} from 'strangelove';

export type Child = JSXNode<any, any> | string | null | undefined;

export type DomProps = {
  parent: HTMLElement;
  position: number;
};

export type FC<TProps extends Record<any, any>> = (
  props: TProps,
  ctx: Ctx<TProps>
) => JSXNode | JSXNode[] | Promise<JSXNode> | Promise<JSXNode[]>;

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
  abstract getStringStream(ctx: NodeCtx): Promise<ReadableStream<string>>;
  abstract hydrate(ctx: {
    dom: DomProps;
    parentHydratedNode?: HydratedNode;
  }): Promise<{insertedCount: number; hydratedNode: HydratedNode}>;
}

export function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}
