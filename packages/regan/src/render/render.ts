import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, GlobalClientCtx} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
// import {
//   convertFromVirtualToHNodes,
//   createVirtualFromRenderTemplate,
// } from './convert/convert.ts';
import {RenderTemplateExtended} from './types.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt, defaultContextEnt} from '../context/context.tsx';
import {VOld} from '../v/types.ts';
import {virtualApplyExternal} from '../v/v.ts';
import {DomPointer} from '../types.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-atoms-snapshot.ts';
import {convertRendterTemplateToV} from './convert/from.ts';
import {convertRenderTemplateToHNodes} from './convert/to.ts';

export const rednerVirtual = async ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentSegmentEnt,
  parentContextEnt,
  domPointer,
  jsxSegmentName = 'root',
  vOlds = [],
}: {
  node: JsxNode;
  domPointer: DomPointer;
  window?: Window;
  data?: Record<any, any>;
  parentHNode?: HNode;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt?: ContextEnt;
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

  const contextEnt = parentContextEnt ?? defaultContextEnt;

  const {renderTemplate} = await node.render({
    parentSegmentEnt,
    globalCtx,
    globalClientCtx,
    jsxSegmentName,
    parentContextEnt: contextEnt,
    renderCtx: {
      treeAtomsSnapshot: new TreeAtomsSnapshot(),
    },
  });

  const vNews = convertRendterTemplateToV(renderTemplate);

  virtualApplyExternal({
    vNews,
    vOlds,
    window: localWindow,
    hNode: parentHNode,
    domPointer,
  });

  const hNode = convertRenderTemplateToHNodes(
    renderTemplate as RenderTemplateExtended
  );

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

export const render = async (
  element: HTMLElement,
  node: JsxNode,
  options: {window: Window} = {window}
) => {
  const hNode = await rednerVirtual({
    node,
    domPointer: {
      parent: element,
      nodeCount: 0,
    },
    window: options.window,
  });

  return hNode;
};
