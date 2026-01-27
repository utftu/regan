import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {Data, DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {GlobalErrorHandler, throwGlobalSystemErros} from '../errors/helpers.ts';
import {defaultData} from '../consts.ts';

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
    initDomPointer: domPointer,
  });

  const globalCtx = new GlobalCtx({
    data,
    mode: 'client',
    root: new Root(),
    clientCtx: globalClientCtx,
    errorHandlers,
  });

  const areaCtx = new AreaCtx();

  try {
    const {hNode} = node.hydrate({
      jsxSegmentName: '',
      domPointer,
      globalCtx,
      areaCtx,
      hydrateCtx: {},
      lastText: false,
    });
    mountHNodes(hNode);

    return {hNode};
  } catch (error) {
    throwGlobalSystemErros(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }
}

export const hydrate = (
  element: HTMLElement | Document,
  node: JsxNode,
  options?: {window?: Window; data?: Data}
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
