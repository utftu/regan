import {Atom} from 'strangelove';
import {JsxNode} from './jsx-node/jsx-node.ts';
import {Ctx} from './ctx/ctx.ts';

export type DomPointer = {
  parent: ParentNode;
  nodeCount: number;
};

export type AnyFunc = (...args: any[]) => any;

export type SingleChild =
  | JsxNode
  | string
  | null
  | undefined
  | void
  | Atom
  | ((...args: any[]) => any);

export type Child = SingleChild | SingleChild[];

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => Child;

export type Props = Record<string, any>;

export type SystemProps = {
  key?: string;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
};

export type Data = {envs: Record<any, any>; props: Record<any, any>} & Record<
  any,
  any
>;
