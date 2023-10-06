import {Child, JSXNode} from './node/node.ts';
import {Ctx} from './node/ctx/ctx.ts';

export type Props = Record<string, any>;

export type Atom<TValue> = {
  get: () => TValue;
  set: (value: TValue) => boolean;
};

export type NodeCtx = {};

export type Unmount = () => void;
export type Mount = () => Unmount | Promise<Unmount> | any;

// export type Ctx<TProps = any> = {
//   props: TProps;
//   mount: Mount;
//   select: Function;
//   children: Child | Child[];
//   // config: {
//   //   disableSubscribe: boolean;
//   // };
// };

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => JSXNode | JSXNode[] | Promise<JSXNode> | Promise<JSXNode[]>;
