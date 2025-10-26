import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {GlobalErrorHandler, throwGlobalSystemErros} from '../errors/helpers.ts';
import {createErrorRegan} from '../errors/errors.tsx';

export function hydrateRaw({
  node,
  window: windowLocal = window,
  data = {},
  domPointer,
  errorHandlers = [],
}: {
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
  domPointer: DomPointer;
  errorHandlers?: GlobalErrorHandler[];
}) {
  const globalClientCtx = new GlobalClientCtx({
    window: windowLocal,
    initDomPointer: domPointer,
  });

  const globalCtx = new GlobalCtx({
    data,
    mode: 'client',
    root: new Root(),
    clientCtx: globalClientCtx,
    errorHandlers,
  });

  globalCtx.clientCtx = globalClientCtx;

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
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  return hydrateRaw({
    domPointer: {
      parent: element,
      nodeCount: 0,
    },

    window: options.window,
    node,
  });
};
