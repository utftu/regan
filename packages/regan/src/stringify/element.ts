import {Atom} from 'strangelove';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {createElementString} from './flat.ts';
import {createErrorJsxNodeComponent} from '../errors/helpers.ts';

const prepareProps = (props: Record<string, any>) => {
  const newProps: Props = {};

  for (const key in props) {
    const value = props[key];

    if (typeof value === 'function') {
      continue;
    }

    if (value instanceof Atom) {
      newProps[key] = value.get();
      continue;
    }

    newProps[key] = value;
  }

  return newProps;
};

export function getStringStreamElement(
  this: JsxNodeElement,
  props: StringifyProps
): StringifyResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  const preparedProps = prepareProps(this.props);

  const elementString = createElementString({
    tagName: this.tagName,
    props: preparedProps,
  });

  let hadnlerChildrenResult: HandleChildrenStringifyResult;
  try {
    hadnlerChildrenResult = handleChildrenString({
      children: this.children,
      parentContextEnt: props.parentContextEnt,
      parentSegmentEnt: segmentEnt,
      globalCtx: props.globalCtx,
      stringifyContext: props.stringifyContext,
    });
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return jsxNodeComponent.stingify(props);
  }

  return {
    text: `${elementString.left}${hadnlerChildrenResult.text}${elementString.right}`,
  };
}
