import {HNode} from '../../h-node/h-node.ts';
import {RenderTemplateExtended} from '../template.types.ts';

const connectChildren = (
  parentHNode: HNode,
  renderTemplates: RenderTemplateExtended[]
) => {
  const children = renderTemplates.map((childRenderTemplate) => {
    const childHNode = convertFromRtToH(childRenderTemplate);
    childHNode.parent = parentHNode;

    return childHNode;
  });
  parentHNode.children = children;
};

export const convertFromRtToH = (
  renderTemplate: RenderTemplateExtended
): HNode => {
  if (renderTemplate.type === 'text') {
    const hNode = renderTemplate.createHNode({
      domNode: renderTemplate.vOld.textNode,
    });
    return hNode;
  }
  if (renderTemplate.type === 'element') {
    const hNode = renderTemplate.createHNode(renderTemplate.vOld);
    connectChildren(hNode, renderTemplate.children);

    return hNode;
  }
  if (renderTemplate.type === 'component') {
    const hNode = renderTemplate.createHNode();
    connectChildren(hNode, renderTemplate.children);

    return hNode;
  }

  throw new Error('Unknown render template type');
};
