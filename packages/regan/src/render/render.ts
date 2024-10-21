import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeBase, HNodeCtx, mountHNodes} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {Root} from '../root/root.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {DomPointerElement} from '../types.ts';
import {Ctx} from '../ctx/ctx.ts';
import {JsxSegmentWrapper} from '../jsx-path/jsx-path.ts';
import {convertFromVirtualToHNodes, createVirtual} from './convert.ts';
import {virtualApply, VOld} from '../v/v.ts';
import {insertNodesAtPosition} from '../utils/dom.ts';
import {RenderTemplateExtended} from './types.ts';

export const rednerVirtual = async ({
  node,
  window: localWindow = window,
  parentHNode,
  data,
  parentCtx,
  domPointer,
  jsxSegmentWrapper,
  vOlds = [],
}: {
  node: JsxNode;
  domPointer: DomPointerElement;
  window?: Window;
  data?: Record<any, any>;
  parentHNode?: HNode;
  jsxSegmentStr?: string;
  parentCtx?: Ctx;
  jsxSegmentWrapper?: JsxSegmentWrapper;
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
    parentHNode?.hNodeCtx ??
    new HNodeCtx({
      window: localWindow,
      initDomPointer: domPointer,
    });
  const {renderTemplate} = await node.render({
    jsxSegmentWrapper: jsxSegmentWrapper ?? {
      parent: undefined,
      name: 'root',
    },
    parentCtx,
    globalCtx,
    hNodeCtx,
    renderCtx: {
      snapshot: new TreeAtomsSnapshot(),
      changedAtoms: [],
    },
  });

  const vNews = createVirtual(renderTemplate);

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
    parentHNode,
    globalCtx,
    hNodeCtx,
  });

  mountHNodes(hNode);

  return hNode;
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
