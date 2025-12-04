import {HNode} from '../../h-node/h-node.ts';
import {RenderTExtended} from '../template.types.ts';

const connectChildren = (
  parentHNode: HNode,
  renderTemplates: RenderTExtended[]
) => {
  const children = renderTemplates.map((childRenderTemplate) => {
    const childHNode = convertFromRtToH(childRenderTemplate);
    childHNode.parent = parentHNode;

    return childHNode;
  });
  parentHNode.children = children;
};

export const convertFromRtToH = (renderTemplate: RenderTExtended): HNode => {
  if (renderTemplate.type === 'text') {
    const hNode = renderTemplate.createHNode(renderTemplate.vOld);
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
