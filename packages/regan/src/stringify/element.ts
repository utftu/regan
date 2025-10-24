import {Atom, checkAtom} from 'strangelove';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {createElementString} from './flat.ts';

const prepareProps = (props: Record<string, any>) => {
  const newProps: Props = {};

  for (const key in props) {
    const value = props[key];

    if (typeof value === 'function') {
      continue;
    }

    if (checkAtom(value)) {
      newProps[key] = value.get();
      continue;
    }

    newProps[key] = value;
  }

  return newProps;
};

export function stringifyElement(
  this: JsxNodeElement,
  props: StringifyProps
): StringifyResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt: props.parentSegmentEnt?.contextEnt,
  });
  this.segmentEnt = segmentEnt;

  const preparedProps = prepareProps(this.props);

  const elementString = createElementString({
    tagName: this.tagName,
    props: preparedProps,
  });

  if (this.props.rawHtml) {
    return {
      text: `${elementString.left}${this.props.rawHtml}${elementString.right}`,
    };
  }

  let hadnlerChildrenResult: HandleChildrenStringifyResult =
    handleChildrenString({
      children: this.children,
      parentSegmentEnt: segmentEnt,
      globalCtx: props.globalCtx,
      stringifyContext: props.stringifyContext,
    });
  // try {
  //   hadnlerChildrenResult = handleChildrenString({
  //     children: this.children,
  //     parentSegmentEnt: segmentEnt,
  //     globalCtx: props.globalCtx,
  //     stringifyContext: props.stringifyContext,
  //   });
  // } catch (error) {
  //   const jsxNodeComponent = createErrorJsxNodeComponent(
  //     this,
  //     error,
  //     props.parentSegmentEnt?.contextEnt
  //   );

  //   return jsxNodeComponent.stingify(props);
  // }

  return {
    text: `${elementString.left}${hadnlerChildrenResult.text}${elementString.right}`,
  };
}
