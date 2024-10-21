import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {VNew, VNewElement, VNewText} from '../v/v.ts';
import {
  RenderTemplate,
  RenderTemplateElementExtended,
  RenderTemplateExtended,
  RenderTemplateTextExtended,
} from './types.ts';

export const createVirtual = (
  renderTemplate: RenderTemplate,
  store: {vNew?: VNewText} = {}
): VNew[] => {
  if (renderTemplate.type === 'text') {
    if (!store.vNew) {
      store.vNew = {
        ...renderTemplate.vNew,
      };
    }
    const start = store.vNew.text.length;

    const vNew = store.vNew;
    store.vNew.text += renderTemplate.vNew.text;

    const oldInit = store.vNew.init;
    store.vNew.init = (text, vOld) => {
      oldInit.call(vNew, text, vOld);
      const renderTemplateExtended =
        renderTemplate as RenderTemplateTextExtended;
      renderTemplateExtended.vOld = vOld;
      renderTemplateExtended.start = start;
    };
    return [vNew];
  }
  if (renderTemplate.type === 'element') {
    store.vNew = undefined;
    const children = renderTemplate.children
      .map((renderTemplate) => createVirtual(renderTemplate, store))
      .flat();
    store.vNew = undefined;

    const vNewResult: VNewElement = {
      ...renderTemplate.vNew,
      children,
    };

    const oldInit = vNewResult.init;
    vNewResult.init = (elementVirtual, vOld) => {
      oldInit.call(vNewResult, elementVirtual, vOld);
      const renderTemplateExtended =
        renderTemplate as RenderTemplateElementExtended;
      renderTemplateExtended.vOld = vOld;
    };

    return [vNewResult];
  }

  return renderTemplate.children
    .map((renderTemplate) => createVirtual(renderTemplate, store))
    .flat();
};

export const convertFromVirtualToHNodes = ({
  renderTemplate,
  parentHNode,
  hNodeCtx,
  globalCtx,
}: {
  renderTemplate: RenderTemplateExtended;
  hNodeCtx: HNodeCtx;
  globalCtx: GlobalCtx;
  parentHNode?: HNode;
}): HNode => {
  if (renderTemplate.type === 'text') {
    return new HNodeText(
      {
        parent: parentHNode,
        jsxSegment: renderTemplate.jsxSegment,
        hNodeCtx,
        globalCtx,
      },
      {
        start: renderTemplate.start,
        text: renderTemplate.vOld.text,
        domNode: renderTemplate.vOld.node,
      }
    );
  } else if (renderTemplate.type === 'element') {
    return new HNodeElement(
      {
        parent: parentHNode,
        jsxSegment: renderTemplate.jsxSegment,
        hNodeCtx,
        globalCtx,
        children: renderTemplate.children.map((child) =>
          convertFromVirtualToHNodes({
            renderTemplate: child,
            parentHNode,
            hNodeCtx,
            globalCtx,
          })
        ),
      },
      {jsxNode: renderTemplate.jsxNode, element: renderTemplate.vOld.node}
    );
  } else {
    return renderTemplate.hNode;
  }
};
