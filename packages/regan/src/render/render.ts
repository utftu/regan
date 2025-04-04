import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
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
import {virtualApplyExternal} from '../v/v.ts';

export const rednerVirtual = ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentSegmentEnt,
  domPointer,
  jsxSegmentName = '',
  vOlds = [],
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
  const globalCtx =
    parentHNode?.globalCtx ??
    new GlobalCtx({
      data,
      mode: 'client',
      root: new Root(),
    });

  const globalClientCtx =
    parentHNode?.glocalClientCtx ??
    new GlobalClientCtx({
      window: localWindow,
      initDomPointer: domPointer,
    });

  const {renderTemplate} = node.render({
    parentSegmentEnt,
    globalCtx,
    globalClientCtx,
    jsxSegmentName,
    renderCtx: {
      atomsTracker: new AtomsTracker(),
    },
  });

  const vNews = convertFromRtToV(renderTemplate);

  virtualApplyExternal({
    vNews,
    vOlds,
    window: localWindow,
    domPointer,
  });

  const hNode = convertFromRtToH(renderTemplate as RenderTemplateExtended);

  if (parentHNode) {
    parentHNode.children.push(hNode);
    hNode.parent = parentHNode;
  }

  mountHNodes(hNode);

  return {
    vOlds: vNews as VOld[],
    hNode,
  };
};

export const render = (
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  const hNode = rednerVirtual({
    node,
    domPointer: {
      parent: element,
      elementsCount: 0,
    },
    window: options.window,
  });

  return hNode;
};
