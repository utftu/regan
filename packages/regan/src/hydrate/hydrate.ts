import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {HNode} from '../h-node/h-node.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';

export function hydrateRaw({
  node,
  parentHNode,
  window: windowLocal = window,
  data = {},
  domPointer,
}: {
  parentHNode?: HNode;
  node: JsxNode;
  window?: Window;
  data?: Record<any, any>;
  domPointer: DomPointer;
}) {
  const atomTracker = new AtomsTracker();

  const {hNode} = node.hydrate({
    jsxSegmentName: '',
    domPointer,
    parentHNode,
    globalCtx:
      parentHNode?.globalCtx ??
      new GlobalCtx({
        data,
        mode: 'client',
        root: new Root(),
      }),
    globalClientCtx:
      parentHNode?.glocalClientCtx ??
      new GlobalClientCtx({
        window: windowLocal,
        initDomPointer: domPointer,
      }),
    hydrateCtx: {
      atomTracker,
    },
  });

  atomTracker.finish();

  mountHNodes(hNode);
}

export const hydrate = (
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  return hydrateRaw({
    domPointer: {
      parent: element,
      elementsCount: 0,
    },

    window: options.window,
    node,
  });
};
