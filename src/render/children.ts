import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../hydrate/h-node.ts';
import {DomSimpleProps} from '../node/node.ts';
import {Child} from '../types.ts';
import {joinPath} from '../utils.ts';

export async function handleChildrenRender({
  children,
  parentHydratedNode,
  dom,
  globalCtx,
  jsxPath,
}: {
  dom: DomSimpleProps;
  children: Child[];
  parentHydratedNode?: HNode;
  globalCtx: GlobalCtx;
  jsxPath: string;
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

    const renderResult = await child.render({
      dom: {parent: dom.parent},
      parentHydratedNode,
      globalCtx,
      jsxPath: joinPath(jsxPath, insertedJsxNodeCount.toString()),
    });
    hydratedNodes.push(renderResult.hydratedNode);

    insertedJsxNodeCount++;
  }
  return {
    hydratedNodes,
  };
}
