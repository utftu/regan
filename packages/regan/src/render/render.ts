import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {VOld} from '../v/types.ts';
import {Data, DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {HNode} from '../h-node/h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {convertFromRtToV} from './convert/from-rt-to-v.ts';
import {convertFromRtToH} from './convert/from-rt-to-h.ts';
import {RenderTExtended} from './template.types.ts';
import {virtualApply} from '../v/v.ts';
import {throwGlobalSystemError} from '../errors/helpers.ts';

export const renderRaw = ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentSegmentEnt,
  domPointer,
  jsxSegmentName = '',
}: {
  node: JsxNode;
  domPointer: DomPointer;
  window?: Window;
  data?: Data;
  parentHNode?: HNode;
  parentSegmentEnt?: SegmentEnt;
  jsxSegmentName?: string;
  vOlds?: VOld[];
}) => {
  const globalClientCtx =
    parentHNode?.globalCtx.clientCtx ??
    new GlobalClientCtx({
      window: localWindow,
      initDomPointer: domPointer,
    });

  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      mode: 'client',
      root: new Root(),
      clientCtx: globalClientCtx,
    });

  const areaCtx = new AreaCtx();

  try {
    const {renderTemplate} = node.render({
      parentSegmentEnt,
      renderCtx: {
        areaCtx,
        globalCtx,
      },
      jsxSegmentName,
    });

    return {renderTemplate};
  } catch (error) {
    throw throwGlobalSystemError(error, globalCtx);
  } finally {
    areaCtx.updaterInit.cancel();
  }
};

export const render = (
  element: HTMLElement,
  node: JsxNode,
  {window: localWindow}: {window: Window} = {window},
) => {
  const domPointer = {
    parent: element,
    nodeCount: 0,
  };

  const {renderTemplate} = renderRaw({
    node,
    window: localWindow,
    parentHNode: undefined,
    parentSegmentEnt: undefined,
    domPointer,
  });

  const vNews = convertFromRtToV(renderTemplate);

  virtualApply({
    vNews,
    vOlds: [],
    window: localWindow,
    domPointer,
  });

  const hNode = convertFromRtToH(renderTemplate as RenderTExtended);

  mountHNodes(hNode);

  return {hNode};
};
