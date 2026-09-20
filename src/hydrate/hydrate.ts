import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../ctx/global.ts';
import {Data, DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {throwGlobalSystemError} from '../errors/handle.ts';
import {GlobalErrorHandler} from '../errors/errors.ts';
import {defaultData} from '../consts.ts';
import {hydrateJsxNode} from './children.ts';

export function hydrateRaw({
  node,
  window: windowLocal,
  data = defaultData,
  domPointer,
  errorHandlers = [],
}: {
  node: JsxNode;
  window?: Window;
  data?: Data;
  domPointer: DomPointer;
  errorHandlers?: GlobalErrorHandler[];
}) {
  const globalClientCtx = new GlobalClientCtx({
    window: windowLocal || window,
    initInsertPoint: {parent: domPointer.parent},
  });

  const globalCtx = new GlobalCtx({
    data,
    clientCtx: globalClientCtx,
    errorHandlers,
  });

  const areaCtx = new AreaCtx();

  try {
    const {hNode} = hydrateJsxNode(node, {
      jsxSegmentName: '',
      domPointer,
      globalCtx,
      areaCtx,
    });
    mountHNodes(hNode);

    return {hNode};
  } catch (error) {
    throwGlobalSystemError(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }
}

export const hydrate = (
  element: HTMLElement | Document,
  node: JsxNode,
  options?: {window?: Window; data?: Data},
) => {
  return hydrateRaw({
    domPointer: {
      parent: element,
      nodeCount: 0,
    },
    data: options?.data || defaultData,

    window: options?.window,
    node,
  });
};
