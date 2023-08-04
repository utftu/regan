import {Child} from '../node.ts';
import {NodeCtx} from '../../types';

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

type StringStream = TransformStream<string, string>;

export function createElementString({
  type,
  props,
}: {
  type: string;
  props: Props;
}) {
  const left = `<${type} ${Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')}>`;
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`;
  return {left, right};
}

export async function handleChildren({
  children,
  streams,
  ctx,
  writer,
}: {
  children: Child[];
  streams: StringStream;
  ctx: NodeCtx;
  writer: WritableStreamDefaultWriter<string>;
}) {
  const childrenStreams = children.map((child) => {
    if (typeof child === 'string') {
      return child;
    }
    return child.getStringStream({ctx});
  });

  for (const childStreamsPromise of childrenStreams) {
    if (typeof childStreamsPromise === 'string') {
      writer.write(childStreamsPromise);
      continue;
    }

    const childStreams = await childStreamsPromise;

    console.log('-----', 'childStreams', childStreams);
    await childStreams.readable.pipeTo(streams.writable, {preventClose: true});
    await childStreams.writable.close();
  }
}
