import {Child} from './node/node.ts';

export type Atom<TValue> = {
  get: () => TValue;
  set: (value: TValue) => boolean;
};

export type NodeCtx = {};

export type Ctx<TProps = any> = {
  props: TProps;
  mount: Function;
  select: Function;
  children: Child | Child[];
  // config: {
  //   disableSubscribe: boolean;
  // };
};
