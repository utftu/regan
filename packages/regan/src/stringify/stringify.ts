import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';

import {Root} from '../root/root.ts';

// async function convertStreamToString(stream: ReadableStream) {
//   const reader = stream.getReader();
//   let result = '';

//   while (true) {
//     const {done, value} = await reader.read();

//     if (done) {
//       break;
//     }

//     result += value;
//   }

//   return result;
// }

// export const getStringStream = async (node: JsxNode) => {
//   const stream = await node.getStringStream({
//     pathSegmentName: '',
//     globalCtx: new GlobalCtx({
//       mode: 'server',
//       data: {},
//       root: new Root(),
//     }),
//     stringContext: {
//       snapshot: new TreeAtomsSnapshot(),
//     },
//   });
//   return stream;
// };

export function stringify(node: JsxNode) {
  const {text} = node.stingify({
    globalCtx: new GlobalCtx({
      mode: 'server',
      data: {},
      root: new Root(),
    }),
    pathSegmentName: '',
    stringifyContext: {},
  });

  return text;
}
