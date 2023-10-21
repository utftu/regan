import {Child, JSXNode} from '../node.ts';
import {NodeCtx} from '../../types.ts';
import {Props} from '../node.ts';
import {Atom} from 'strangelove';
// import { Atom } from '../../types.ts';

// todo
// class Atom {
//   get(): any {}
// }

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
  const preparedProperties = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  const left = `<${type}${
    preparedProperties.length === 0 ? '' : ` ${preparedProperties}`
  }>`;
  const right = selfClosingTags.includes(type) ? '' : `</${type}>`;
  return {left, right};
}

export async function handleChildrenString({
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
    if (child instanceof JSXNode) {
      return child.getStringStream({ctx});
    }

    return child;
  });

  for (const childStream of childrenStreams) {
    // null, undefined
    if (!childStream) {
      continue;
    }

    if (typeof childStream === 'string') {
      const writer = streams.writable.getWriter();
      await writer.write(childStream);
      await writer.releaseLock();
      continue;
    }

    const childStreams = await childStream;

    await childStreams.pipeTo(streams.writable, {preventClose: true});
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

export async function getString(node: JSXNode<any, any>) {
  const stream = await node.getStringStream({} as any);
  const str = await convertStreamToString(stream);
  return str;
}
