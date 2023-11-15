import {JSXNode} from '../node.ts';
import {Child, Props} from '../../types.ts';
import {Atom} from 'strangelove';
import {joinPath} from '../../utils.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SELECT_REGAN_NAMED} from '../../atoms/atoms.ts';

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
  jsxPath,
  globalCtx,
}: {
  children: Child[];
  streams: StringStream;
  jsxPath: string;
  globalCtx: GlobalCtx;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;
  const childrenStreams = children.map((rawChild) => {
    const child = typeof rawChild === 'function' ? rawChild() : rawChild;

    if (child instanceof JSXNode) {
      const stream = child.getStringStream({
        jsxPath: joinPath(jsxPath, jsxNodeCount.toString()),
        globalCtx,
      });
      jsxNodeCount++;
      return stream;
    }

    if (child instanceof Atom) {
      let value: any;
      let name: string;
      if ((child as any)[SELECT_REGAN_NAMED]) {
        [name, value] = child.get();
      } else {
        value = child.get();
        name = '0';
      }

      if (value instanceof JSXNode) {
        const newJsxPath = joinPath(jsxPath, jsxNodeCount.toString());
        return value.getStringStream({
          jsxPath: newJsxPath + `:a=${name}`,
          globalCtx,
        });
      }

      jsxNodeCount++;
      return value;
    }

    return rawChild;
  });

  for (const childStream of childrenStreams) {
    // null, undefined
    if (!childStream) {
      continue;
    }

    // todo not only string
    if (typeof childStream === 'string') {
      const writer = streams.writable.getWriter();
      await writer.write(childStream);
      writer.releaseLock();
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

type GetStringConfig = {
  jsxPath?: string;
};

export async function getString(
  node: JSXNode<any, any>,
  config: GetStringConfig = {}
) {
  const stream = await node.getStringStream({
    jsxPath: config.jsxPath || '',
    globalCtx: new GlobalCtx({
      window: null as any,
      status: 'string',
      data: {},
    }),
  });
  const str = await convertStreamToString(stream);
  return str;
}
