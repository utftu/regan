import {Atom} from 'strangelove';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {Fragment} from '../components/fragment/fragment.ts';

export const formatJsxValue = <TValue>(
  value: TValue
): TValue extends () => infer FunctResult ? FunctResult : TValue => {
  const valueResult = typeof value === 'function' ? value() : value;
  return valueResult;
};

export const checkAllowedPrivitive = (value: any): value is string | number => {
  const typeValue = typeof value;

  if (typeValue === 'string' || typeValue === 'number') {
    return true;
  }

  return false;
};

export const checkPassPrimitive = (value: any) => {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return true;
  }
  return false;
};

export const wrapChildIfNeed = (child: JsxNode | Atom) => {
  if (child instanceof Atom) {
    return new JsxNodeComponent(
      {
        children: [],
        props: {
          atom: child,
        },
        systemProps: {},
      },
      {component: AtomWrapper}
    );
  } else if (Array.isArray(child)) {
    return new JsxNodeComponent(
      {
        children: child,
        props: {},
        systemProps: {},
      },
      {component: Fragment}
    );
  } else {
    return child;
  }
};
