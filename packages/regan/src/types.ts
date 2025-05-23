import {Atom} from 'strangelove';
import {JsxNode} from './jsx-node/jsx-node.ts';
import {Ctx} from './ctx/ctx.ts';

export type DomPointer = {
  parent: ParentNode;
  nodeCount: number;
};

export type AnyFunc = (...args: any[]) => any;

export type Child =
  | JsxNode
  | string
  | null
  | undefined
  | void
  | Atom
  | ((...args: any[]) => any);

export type FCReturn = Child | Child[];

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => FCReturn;

export type Props = Record<string, any>;

export type SystemProps = {
  key?: string;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
};
