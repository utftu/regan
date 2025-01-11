import {HNode} from '../h-node/h-node.ts';
import {VNew, VNewElement, VNewText} from '../v/types.ts';
import {
  RenderTemplate,
  RenderTemplateElementExtended,
  RenderTemplateExtended,
  RenderTemplateTextExtended,
} from './types.ts';

export const createVirtualFromRenderTemplate = (
  renderTemplate: RenderTemplate,
  store: {vNew?: VNewText} = {}
): VNew[] => {
  if (renderTemplate.type === 'text') {
    if (!store.vNew) {
      store.vNew = {
        ...renderTemplate.vNew,
      };
    }
    const vNew = store.vNew!;
    const start = vNew.data.text.length;

    // const vNew = store.vNew;
    vNew.data.text += renderTemplate.vNew.text;

    const oldInit = vNew.init;
    vNew.init = (vOld) => {
      oldInit?.call(vNew, vOld);
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
      .map((renderTemplate) =>
        createVirtualFromRenderTemplate(renderTemplate, store)
      )
      .flat();
    store.vNew = undefined;

    const vNewResult: VNewElement = {
      ...renderTemplate.vNew,
      children,
    };

    const oldInit = vNewResult.init;
    vNewResult.init = (vOld) => {
      oldInit?.call(vNewResult, vOld);
      const renderTemplateExtended =
        renderTemplate as RenderTemplateElementExtended;
      renderTemplateExtended.vOld = vOld;
    };

    return [vNewResult];
  }

  // component
  return renderTemplate.children
    .map((renderTemplate) =>
      createVirtualFromRenderTemplate(renderTemplate, store)
    )
    .flat();
};

export const convertFromVirtualToHNodes = ({
  renderTemplate,
}: {
  renderTemplate: RenderTemplateExtended;
}): HNode => {
  if (renderTemplate.type === 'text') {
    const hNode = renderTemplate.createHNode({
      start: renderTemplate.start,
      domNode: renderTemplate.vOld.node,
    });
    return hNode;
  } else if (renderTemplate.type === 'element') {
    const hNode = renderTemplate.createHNode({
      vOld: renderTemplate.vOld,
    });

    hNode.children = renderTemplate.children.map((child) => {
      const childHNode = convertFromVirtualToHNodes({
        renderTemplate: child,
      });
      childHNode.parent = hNode;
      return childHNode;
    });
    return hNode;
  } else {
    // component
    const hNode = renderTemplate.createHNode();
    hNode.children = renderTemplate.children.map((child) => {
      const childHNode = convertFromVirtualToHNodes({
        renderTemplate: child,
      });
      childHNode.parent = hNode;
      return childHNode;
    });
    return hNode;
  }
};
