import {JSXNodeComponent} from '../node/component/component.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {FC, Child} from '../node/node.ts';
import {Props} from '../types.ts';

type PropsPrepareRaw = {
  type: string | FC<any>;
  props: Props;
  children: Children;
  key?: string;
};

type RawChildren = Child | Child[];
type Children = Child[];
type ElementType = string | FC<any>;

const prepare = ({type, props, key, children}: PropsPrepareRaw) => {
  const preparedKey = key === undefined ? '' : key;
  if (typeof type === 'string') {
    return new JSXNodeElement({type, props, key: preparedKey, children});
  }
  return new JSXNodeComponent({type, props, key: preparedKey, children});
};

export const normalizeChildren = (rawChildren: RawChildren) => {
  if (rawChildren === undefined) {
    return [];
  } else if (Array.isArray(rawChildren)) {
    return rawChildren;
  } else {
    return [rawChildren];
  }
};

export const createElement = (
  type: ElementType,
  rawProps: {
    key?: string;
  } & Props,
  ...rawChildren: Children
) => {
  const {key, ...props} = rawProps;

  return prepare({
    type,
    props,
    key,
    children: normalizeChildren(rawChildren),
  });
};

export function jsx<TProps extends Props>(
  type: ElementType,
  rawProps: {children: RawChildren} & TProps,
  key?: string
) {
  const {children: rawChildren, ...props} = rawProps;

  return prepare({
    type,
    props,
    key,
    children: normalizeChildren(rawChildren),
  });
}
