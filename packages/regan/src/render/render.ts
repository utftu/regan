import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Root} from '../root/root.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {VOld} from '../v/types.ts';
import {DomPointer} from '../types.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {HNode} from '../h-node/h-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AtomsTracker} from '../atoms-tracker/atoms-tracker.ts';
import {convertFromRtToV} from './convert/from-rt-to-v.ts';
import {convertFromRtToH} from './convert/from-rt-to-h.ts';
import {RenderTemplateExtended} from './template.types.ts';
import {virtualApply} from '../v/v.ts';

export const rednerRaw = ({
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
  data?: Record<any, any>;
  parentHNode?: HNode;
  parentSegmentEnt?: SegmentEnt;
  jsxSegmentName?: string;
  vOlds?: VOld[];
}) => {
  const atomsTracker = new AtomsTracker();

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
      globalCtx,
      jsxSegmentName,
      areaCtx,
    });

    areaCtx.updaterInit.cancel();

    return {renderTemplate};
  } finally {
    areaCtx.updaterInit.cancel();
  }
};

export const render = (
  element: HTMLElement,
  node: JsxNode,
  {window: localWindow}: {window: Window} = {window}
) => {
  const domPointer = {
    parent: element,
    nodeCount: 0,
  };

  const {renderTemplate} = rednerRaw({
    node,
    window: localWindow,
    parentHNode: undefined,
    data: {},
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

  const hNode = convertFromRtToH(renderTemplate as RenderTemplateExtended);

  mountHNodes(hNode);

  return {hNode};
};
