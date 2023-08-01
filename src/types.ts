export type Atom<TValue> = {
  get: () => TValue;
  set: (value: TValue) => boolean;
};

export type NodeCtx = {};

export type ComponentCtx<TProps> = {
  props: TProps;
  mount: Function;
  select: Function;
  // config: {
  //   disableSubscribe: boolean;
  // };
};
