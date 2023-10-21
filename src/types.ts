import {JSXNode} from './node/node.ts';
import {Ctx} from './node/ctx/ctx.ts';

export type Child = JSXNode<any, any> | string | null | undefined;
export type Props = Record<string, any>;

export type NodeCtx = {};

export type Unmount = () => void;
export type Mount = () => Unmount | Promise<Unmount> | any;

export type FCReturn =
  | JSXNode
  | JSXNode[]
  | Promise<JSXNode>
  | Promise<JSXNode[]>
  | string
  | null
  | undefined
  | void;

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => FCReturn;

// export type FC<TProps extends Record<any, any> = any> = (
//   props: TProps,
//   ctx: Ctx<TProps>
// ) =>
//   | JSXNode
//   | JSXNode[]
//   | Promise<JSXNode>
//   | Promise<JSXNode[]>
//   | null
//   | undefined;
