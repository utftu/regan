import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {mountHNodes} from '../h-node/helpers.ts';

export function hydrateRaw({
  node,
  window: windowLocal = window,
  data = {},
  domPointer,
}: {
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
  domPointer: DomPointer;
}) {
  const globalCtx = new GlobalCtx({
    data,
    mode: 'client',
    root: new Root(),
  });

  const globalClientCtx = new GlobalClientCtx({
    window: windowLocal,
    initDomPointer: domPointer,
  });

  globalCtx.globalClientCtx = globalClientCtx;

  const areaCtx = new AreaCtx();

  try {
    const {hNode} = node.hydrate({
      jsxSegmentName: '',
      domPointer,
      globalCtx,
      globalClientCtx,
      areaCtx,
      hydrateCtx: {},
      lastText: false,
    });
    mountHNodes(hNode);

    return {hNode};
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
