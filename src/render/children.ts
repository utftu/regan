import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JSXNode} from '../node/node.ts';
import {AddElementToParent, RenderCtx} from '../node/render/render.ts';
import {Child} from '../types.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  addElementToParent,
  renderCtx,
  hNodeCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
}) {
  const hNodes: HNode[] = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!child) {
      continue;
    }

    if (typeof child === 'string') {
      addElementToParent(child);
      continue;
    }

    const renderResult = await (child as JSXNode).render({
      parentHNode,
      globalCtx,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxNodeCount,
      },
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      renderCtx,
      addElementToParent,
      hNodeCtx,
    });
    hNodes.push(renderResult.hNode);

    insertedJsxNodeCount++;
  }

  return {
    hNodes,
  };
}
