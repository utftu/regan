import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SingleChild, FC, Props} from '../types.ts';
import {separateProps} from './props.ts';

type RawChildren = SingleChild | SingleChild[];
type ElementType = string | FC<any>;

type PropsPrepareRaw = {
  type: string | FC<any>;
  props: Props;
  children: SingleChild[];
};

const prepare = ({type, props, children}: PropsPrepareRaw) => {
  const {userProps, systemProps} = separateProps(props);
  if (typeof type === 'string') {
    return new JsxNodeElement(
      {
        props: userProps,
        systemProps,
        children,
      },
      {tagName: type}
    );
  }
  return new JsxNodeComponent({props, children}, {component: type});
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
  ...rawChildren: SingleChild[]
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

  const preparedProps: Props = {
    ...props,
  };

  if (typeof key === 'string') {
    preparedProps.key = key;
  }

  return prepare({
    type,
    props: preparedProps,
    children: normalizeChildren(rawChildren),
  });
}

export function jsxDEV<TProps extends Props>(
  type: ElementType,
  rawProps: {children: RawChildren} & TProps,
  key?: string,
  ...devArgs: any[]
) {
  const jsxNode = jsx(type, rawProps, key);

  if (devArgs[1]) {
    (jsxNode as any).source = devArgs[1];
  }

  return jsxNode;
}

export const jsxs = jsx;

export function h(
  type: ElementType,
  props: Props = {},
  children: SingleChild[] = []
) {
  return prepare({
    type,
    props,
    children: normalizeChildren(children),
  });
}
