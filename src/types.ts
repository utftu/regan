export type Atom<TValue> = {
  get: () => TValue,
  set: (value: TValue) => boolean
}

export type Ctx<TProps> = {
  props: TProps,
  mount: Function,
  select: Function,
  config: {
    disableSubscribe: boolean
  }
}