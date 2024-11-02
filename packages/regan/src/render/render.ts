import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, GlobalClientCtx} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {DomPointerElement} from '../types.ts';
import {
  convertFromVirtualToHNodes,
  createVirtualFromRenderTemplate,
} from './convert.ts';
import {virtualApply} from '../v/v.ts';
import {insertNodesAtPosition} from '../utils/dom.ts';
import {RenderTemplateExtended} from './types.ts';
import {mountHNodes} from '../h-node/helpers.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt, defaultContextEnt} from '../context/context.tsx';
import {VOld} from '../v/types.ts';

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
  domPointer: DomPointerElement;
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

  const hNodeCtx =
    parentHNode?.glocalClientCtx ??
    new GlobalClientCtx({
      window: localWindow,
      initDomPointer: domPointer,
    });

  const contextEnt = parentContextEnt ?? defaultContextEnt;

  const {renderTemplate} = await node.render({
    parentSegmentEnt,
    globalCtx,
    globalClientCtx: hNodeCtx,
    jsxSegmentName,
    parentContextEnt: contextEnt,
    renderCtx: {
      changedAtoms: new Set(),
    },
  });

  const vNews = createVirtualFromRenderTemplate(renderTemplate);

  const tmpTemplate = localWindow.document.createElement('template');

  virtualApply({
    vNews,
    vOlds,
    window: localWindow,
    parentElement: tmpTemplate,
  });

  const children = Array.from(tmpTemplate.content.childNodes);

  insertNodesAtPosition(domPointer.parent, domPointer.position, children);

  const hNode = convertFromVirtualToHNodes({
    renderTemplate: renderTemplate as RenderTemplateExtended,
    // parentHNode,
    // globalCtx,
    // hNodeCtx,
  });

  return {
    hNode,
    mountHNodes: () => {
      if (parentHNode) {
        parentHNode.children.push(hNode);
        hNode.parent = parentHNode;

        // not nessasery detach
        // parentSegmentEnt and parentContextEnt
      }
      mountHNodes(hNode);

      return () => {
        hNode.unmount();
        if (parentHNode) {
          hNode.parent = undefined;
          parentHNode.children = parentHNode.children.filter(
            (child) => child !== hNode
          );
        }
      };
    },
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
      position: 0,
    },
    window: options.window,
  });

  return hNode;
};
