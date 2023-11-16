import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JSXNode} from '../node/node.ts';

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

export async function getString(node: JSXNode, config: GetStringConfig = {}) {
  const stream = await node.getStringStream({
    // jsxPath: config.jsxPath || '',
    jsxSegmentStr: '',
    globalCtx: new GlobalCtx({
      window: null as any,
      status: 'string',
      data: {},
    }),
  });
  const str = await convertStreamToString(stream);
  return str;
}
