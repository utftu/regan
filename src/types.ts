import {Child} from './node/node.ts';

export type Atom<TValue> = {
  get: () => TValue;
  set: (value: TValue) => boolean;
};

export type NodeCtx = {};

export type Unmount = () => void;
export type Mount = () => Unmount | Promise<Unmount> | void;

export type Ctx<TProps = any> = {
  props: TProps;
  mount: Mount;
  select: Function;
  children: Child | Child[];
  // config: {
  //   disableSubscribe: boolean;
  // };
};
