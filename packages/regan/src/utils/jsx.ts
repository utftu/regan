import {Atom} from 'strangelove';
import {JsxNode} from '../node/node.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

export const formatJsxValue = async (value: any) => {
  const valueResult = typeof value === 'function' ? value() : value;
  const awaitedValue = await valueResult;
  return awaitedValue;
};

export const wrapChildIfNeed = (child: JsxNode | Atom) => {
  if (child instanceof Atom) {
    return new JsxNodeComponent({
      type: AtomWrapper,
      children: [],
      props: {
        atom: child,
      },
      systemProps: {},
    });
  } else if (Array.isArray(child)) {
    return new JsxNodeComponent({
      type: Fragment,
      children: child,
      props: {},
      systemProps: {},
    });
  } else {
    return child;
  }
};
