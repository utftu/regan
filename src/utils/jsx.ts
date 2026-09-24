import {checkIon, Ion} from 'strangelove';
import {
  checkJsxNode,
  createJsxNodeComponent,
  JsxNode,
} from '../jsx-node/jsx-node.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

export const formatJsxValue = <TValue>(
  value: TValue,
): TValue extends () => infer FunctResult ? FunctResult : TValue => {
  const valueResult = typeof value === 'function' ? value() : value;
  return valueResult;
};

export const checkAllowedPrimitive = (value: any): value is string | number => {
  const typeValue = typeof value;

  if (typeValue === 'string' || typeValue === 'number') {
    return true;
  }

  return false;
};

export function checkPassPrimitive(value: any) {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return true;
  }

  // пустая строка не даёт узла в SSR, поэтому не должна давать его и на
  // клиенте — иначе стадии разойдутся по числу узлов
  if (value === '') {
    return true;
  }

  return false;
}

export const checkAllowedStructure = (value: any) => {
  if (checkJsxNode(value) || checkIon(value) || Array.isArray(value)) {
    return true;
  }

  return false;
};

export const wrapChildIfNeed = (child: JsxNode | Ion) => {
  if (checkIon(child)) {
    return createJsxNodeComponent({
      component: AtomWrapper,
      props: {atom: child},
      children: [],
    });
  }

  if (Array.isArray(child)) {
    return createJsxNodeComponent({
      component: Fragment,
      props: {},
      children: child,
    });
  }

  return child;
};
