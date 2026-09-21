import {checkAtom} from 'strangelove';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {JsxNodeElement} from '../jsx-node/jsx-node.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Props} from '../types.ts';
import {getAttributeValue} from '../utils/attributes.ts';

const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export function createElementString({
  tagName,
  props,
}: {
  tagName: string;
  props: Props;
}) {
  const preparedProperties = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const left = `<${tagName}${
    preparedProperties.length === 0 ? '' : ` ${preparedProperties}`
  }>`;
  const right = selfClosingTags.includes(tagName) ? '' : `</${tagName}>`;
  return {left, right};
}

const prepareProps = (props: Record<string, any>) => {
  const newProps: Props = {};

  for (const key in props) {
    const value = props[key];

    if (typeof value === 'function') {
      continue;
    }

    const attributeValue = getAttributeValue(
      key,
      checkAtom(value) ? value.get() : value,
    );

    if (attributeValue !== undefined) {
      newProps[key] = attributeValue;
    }
  }

  return newProps;
};

export function stringifyElement(
  jsxNode: JsxNodeElement,
  props: StringifyProps,
): StringifyResult {
  const segmentEnt = new SegmentEnt({
    name: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.globalCtx,
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

  let childrenResult: HandleChildrenStringifyResult = handleChildrenString({
    children: jsxNode.children,
    parentSegmentEnt: segmentEnt,
    globalCtx: props.globalCtx,
    areaCtx: props.areaCtx,
    lastText: false,
  });

  return {
    text: `${elementString.left}${childrenResult.text}${elementString.right}`,
    lastText: false,
  };
}
