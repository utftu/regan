import {
  Component,
  Child,
  NodeReactNextElem,
  NodeReactNextComponent,
} from '../node/node.ts';

export function jsx<TProps extends Props>(
  type: string | Component<any>,
  rawProps: {children: Child | Child[]} & TProps,
  key: string
) {
  const {children: rawChidlren, ...props} = rawProps;

  let children: Child[];

  if (rawChidlren === undefined) {
    children = [];
  } else if (Array.isArray(rawChidlren)) {
    children = rawChidlren;
  } else {
    children = [rawChidlren];
  }
  // const children = Array.isArray(rawChidlren) ? rawChidlren : [rawChidlren];
  if (typeof type === 'string') {
    return new NodeReactNextElem({type, props, key, children});
  }
  return new NodeReactNextComponent({type, props, key, children});
}
