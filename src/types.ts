import {JSXNode} from './node/node.ts';
import {Ctx} from './node/ctx/ctx.ts';

export type Child = JSXNode | string | null | undefined;
export type Props = Record<string, any>;

export type NodeCtx = {};

export type Unmount = () => void;
export type Mount = () => Unmount | Promise<Unmount> | any;

class ANode {}

type A1 = ANode | undefined;
type A2 = ANode | ANode[] | undefined;

const a: A2 = null as any as A1;
console.log('-----', 'a', a);

export type FCReturn =
  | string
  | null
  | undefined
  | void
  | JSXNode
  | JSXNode[]
  | Promise<JSXNode>
  | Promise<JSXNode[]>;

const test: string | null | undefined | void | JSXNode | JSXNode[] =
  null as any as Child[];

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
