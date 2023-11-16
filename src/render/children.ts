import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {DomSimpleProps, JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  dom,
  globalCtx,
  parentJsxSegment,
}: // jsxPath,
{
  dom: DomSimpleProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  // jsxPath: string;
}) {
  const hydratedNodes: HNode[] = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!child) {
      continue;
    }

    if (typeof child === 'string') {
      dom.parent.innerHTML = child;
      continue;
    }

    const renderResult = await (child as JSXNode).render({
      dom: {parent: dom.parent},
      parentHNode,
      globalCtx,
      parentJsxSegment,
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      // jsx
      // jsxPath: joinPath(jsxPath, insertedJsxNodeCount.toString()),
    });
    hydratedNodes.push(renderResult.hydratedNode);

    insertedJsxNodeCount++;
  }
  return {
    hydratedNodes,
  };
}
