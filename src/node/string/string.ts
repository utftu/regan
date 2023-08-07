import {Child, ReganJSXNode} from '../node.ts';
import {NodeCtx} from '../../types.ts';
import {Props} from '../node.ts';

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
  const propertiers = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const left = `<${type}${propertiers.length === 0 ? '' : ` ${propertiers}`}>`;
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`;
  return {left, right};
}

export async function handleChildren({
  children,
  streams,
  ctx,
}: // writer,
{
  children: Child[];
  streams: StringStream;
  ctx: NodeCtx;
  // writer: WritableStreamDefaultWriter<string>;
}) {
  const childrenStreams = children.map((child) => {
    if (typeof child === 'string') {
      return child;
    }
    return child.getStringStream({ctx});
  });

  for (const childStreamsPromise of childrenStreams) {
    if (typeof childStreamsPromise === 'string') {
      const writer = streams.writable.getWriter();
      await writer.write(childStreamsPromise);
      await writer.releaseLock();
      continue;
    }

    const childStreams = await childStreamsPromise;

    await childStreams.readable.pipeTo(streams.writable, {preventClose: true});
  }
}

async function convertStreamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  let result = '';

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    result += value;
  }

  return result;
}

export async function getString(node: ReganJSXNode<any, any>) {
  const stream = await node.getStringStream({} as any);
  const str = await convertStreamToString(stream.readable);
  return str;
}
