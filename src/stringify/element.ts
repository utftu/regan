import {checkAtom} from 'strangelove';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {JsxNodeElement} from '../jsx-node/jsx-node.ts';
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

export function stringifyElement(jsxNode: JsxNodeElement, props: StringifyProps): StringifyResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.stringifyCtx.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const preparedProps = prepareProps(jsxNode.props);

  const elementString = createElementString({
    tagName: jsxNode.tagName,
    props: preparedProps,
  });

  if (jsxNode.systemProps.rawHtml) {
    return {
      text: `${elementString.left}${jsxNode.systemProps.rawHtml}${elementString.right}`,
      lastText: false,
    };
  }

  let hadnlerChildrenResult: HandleChildrenStringifyResult =
    handleChildrenString({
      children: jsxNode.children,
      parentSegmentEnt: segmentEnt,
      stringifyCtx: props.stringifyCtx,
      lastText: false,
    });

  return {
    text: `${elementString.left}${hadnlerChildrenResult.text}${elementString.right}`,
    lastText: false,
  };
}
