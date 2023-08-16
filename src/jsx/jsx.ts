import {FC, Child, JSXNodeElement, JSXNodeComponent} from '../node/node.ts';

export function jsx<TProps extends Props>(
  type: string | FC<any>,
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

  if (typeof type === 'string') {
    return new JSXNodeElement({type, props, key, children});
  }
  return new JSXNodeComponent({type, props, key, children});
}
