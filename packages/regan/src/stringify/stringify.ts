import {defaultData} from '../consts.ts';
import {throwGlobalSystemErros} from '../errors/helpers.ts';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {Root} from '../root/root.ts';
import {Data} from '../types.ts';

export function stringify(node: JsxNode, options?: {data?: Data}) {
  const areaCtx = new AreaCtx();

  const globalCtx = new GlobalCtx({
    mode: 'server',
    data: options?.data || defaultData,
    root: new Root(),
    clientCtx: undefined,
  });

  try {
    const {text} = node.stingify({
      stringifyCtx: {
        globalCtx,
        areaCtx,
      },
      pathSegmentName: '',
    });

    return text;
  } catch (error) {
    throwGlobalSystemErros(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }

  throw new Error('Unknown stringify error');
}
