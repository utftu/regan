import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-atoms-snapshot.ts';

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

export const getStringStream = async (node: JsxNode) => {
  const stream = await node.getStringStream({
    jsxSegmentStr: '',
    globalCtx: new GlobalCtx({
      mode: 'server',
      data: {},
      root: new Root(),
    }),
    stringContext: {
      snapshot: new TreeAtomsSnapshot(),
    },
  });
  return stream;
};

export async function getString(node: JsxNode) {
  const stream = await getStringStream(node);
  const str = await convertStreamToString(stream);
  return str;
}
