import {JsxNodeComponent} from '../node/component/component.ts';
import {JSXNodeElement} from '../node/element/element.ts';
import {Child, FC, Props} from '../types.ts';
import {separateProps} from './props/props.ts';

type RawChildren = Child | Child[];
type ElementType = string | FC<any>;

type PropsPrepareRaw = {
  type: string | FC<any>;
  props: Props;
  children: Child[];
};

const prepare = ({type, props, children}: PropsPrepareRaw) => {
  const {userProps, systemProps} = separateProps(props);
  if (typeof type === 'string') {
    return new JSXNodeElement({
      type,
      props: userProps,
      systemProps,
      children,
    });
  }
  return new JsxNodeComponent({type, props, children});
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
  props: Props,
  ...rawChildren: Child[]
) => {
  return prepare({
    type,
    props,
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
    props: {
      ...props,
      key,
    },
    children: normalizeChildren(rawChildren),
  });
}

export function h(type: ElementType, props: Props, children: Child[]) {
  return prepare({
    type,
    props,
    children: normalizeChildren(children),
  });
}
