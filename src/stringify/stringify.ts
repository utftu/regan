import {defaultData} from '../consts.ts';
import {throwGlobalSystemError} from '../errors/handle.ts';
import {AreaCtx, GlobalCtx} from '../ctx/global.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {Data} from '../types.ts';
import {stringifyJsxNode} from './children.ts';

export function stringify(node: JsxNode, options?: {data?: Data}) {
  const areaCtx = new AreaCtx();

  const globalCtx = new GlobalCtx({
    data: options?.data || defaultData,
    clientCtx: undefined,
  });

  try {
    const {text} = stringifyJsxNode(node, {
      globalCtx,
      areaCtx,
      jsxSegmentName: '',
      lastText: false,
    });

    return text;
  } catch (error) {
    throwGlobalSystemError(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }

  throw new Error('Unknown stringify error');
}
