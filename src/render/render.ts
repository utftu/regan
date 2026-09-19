import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {Data, InsertPoint} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {HNode} from '../h-node/h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {applyRenderNodes} from '../v/apply.ts';
import {throwGlobalSystemError} from '../errors/helpers.ts';

export const renderRaw = ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentSegmentEnt,
  insertPoint,
  jsxSegmentName = '',
}: {
  node: JsxNode;
  insertPoint: InsertPoint;
  window?: Window;
  data?: Data;
  parentHNode?: HNode;
  parentSegmentEnt?: SegmentEnt;
  jsxSegmentName?: string;
}) => {
  const globalClientCtx =
    parentHNode?.globalCtx.clientCtx ??
    new GlobalClientCtx({
      window: localWindow,
      initInsertPoint: insertPoint,
    });

  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      clientCtx: globalClientCtx,
    });

  const areaCtx = new AreaCtx();

  try {
    const {renderNode} = node.render({
      parentSegmentEnt,
      renderCtx: {
        areaCtx,
        globalCtx,
      },
      jsxSegmentName,
    });

    return {renderNode};
  } catch (error) {
    throw throwGlobalSystemError(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }
};

export const render = (
  element: HTMLElement,
  node: JsxNode,
  {window: localWindow}: {window: Window} = {window}
) => {
  const insertPoint: InsertPoint = {
    parent: element,
  };

  const {renderNode} = renderRaw({
    node,
    window: localWindow,
    parentHNode: undefined,
    parentSegmentEnt: undefined,
    insertPoint,
  });

  const [hNode] = applyRenderNodes({
    renderNodes: [renderNode],
    oldHNodes: [],
    insertPoint,
    window: localWindow,
  });

  mountHNodes(hNode);

  return {hNode};
};
