import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JSXNode} from '../node/node.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Root} from '../root/root.ts';

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
  const str = await convertStreamToString(stream);
  return str;
}
