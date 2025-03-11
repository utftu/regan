import {Props} from '../types.ts';

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
  type,
  props,
}: {
  type: string;
  props: Props;
}) {
  const preparedProperties = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const left = `<${type}${
    preparedProperties.length === 0 ? '' : ` ${preparedProperties}`
  }>`;
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`;
  return {left, right};
}
