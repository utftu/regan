import {throwGlobalSystemErros} from '../errors/helpers.ts';
import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {Root} from '../root/root.ts';

export function stringify(node: JsxNode) {
  const areaCtx = new AreaCtx();

  const globalCtx = new GlobalCtx({
    mode: 'server',
    data: {},
    root: new Root(),
    clientCtx: undefined,
  });

  try {
    const {text} = node.stingify({
      globalCtx,
      pathSegmentName: '',
      areaCtx,
    });

    return text;
  } catch (error) {
    throwGlobalSystemErros(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }

  throw new Error('Unknow stringify error');
}
