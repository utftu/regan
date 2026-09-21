import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../ctx/global.ts';
import {Data, InsertPoint} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {HNode} from '../h-node/h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {applyRenderNodes} from './apply.ts';
import {renderJsxNode} from './children.ts';
import {throwGlobalSystemError} from '../errors/handle.ts';

export const renderRaw = ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentSegmentEnt,
  insertPoint,
  jsxSegmentName = '',
  oldHNode,
  globalCtx: outerGlobalCtx,
}: {
  node: JsxNode;
  insertPoint: InsertPoint;
  window?: Window;
  data?: Data;
  parentHNode?: HNode;
  parentSegmentEnt?: SegmentEnt;
  jsxSegmentName?: string;
  oldHNode?: HNode;
  globalCtx?: GlobalCtx;
}) => {
  const globalCtx =
    parentHNode?.globalCtx ??
    outerGlobalCtx ??
    new GlobalCtx({
      data,
      clientCtx: new GlobalClientCtx({
        window: localWindow,
        initInsertPoint: insertPoint,
      }),
    });

  const areaCtx = new AreaCtx();

  try {
    const {renderNode} = renderJsxNode(node, {
      parentSegmentEnt,
      globalCtx,
      areaCtx,
      jsxSegmentName,
      oldHNode,
    });

    return {renderNode};
  } finally {
    areaCtx.updaterInit.cancel();
  }
};

export const render = (
  element: HTMLElement,
  node: JsxNode,
  {window: localWindow}: {window: Window} = {window},
) => {
  const insertPoint: InsertPoint = {
    parent: element,
  };

  const globalCtx = new GlobalCtx({
    clientCtx: new GlobalClientCtx({
      window: localWindow,
      initInsertPoint: insertPoint,
    }),
  });

  try {
    const {renderNode} = renderRaw({
      node,
      window: localWindow,
      parentHNode: undefined,
      parentSegmentEnt: undefined,
      insertPoint,
      globalCtx,
    });

    const {hNodes, created} = applyRenderNodes({
      renderNodes: [renderNode],
      oldHNodes: [],
      insertPoint,
      window: localWindow,
    });

    created.forEach((hNode) => hNode.mount());

    return {hNode: hNodes[0]};
  } catch (error) {
    throw throwGlobalSystemError(error, globalCtx);
  }
};
