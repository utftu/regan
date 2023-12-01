import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';

function mountHydratedNodes(hNode: HNode) {
  hNode.mount();
  hNode.children.forEach(mountHydratedNodes);
}

type HydrateConfig = {
  window?: Window;
  jsxPath?: string;
};

export async function hydrate(
  domNode: HTMLElement,
  node: JSXNode,
  config: HydrateConfig = {window}
) {
  const {hNode} = await node.hydrate({
    // jsxPath: config.jsxPath || '',
    jsxSegmentStr: '',
    dom: {parent: domNode, position: 0},
    parentHydratedNode: undefined,
    globalCtx: new GlobalCtx({
      window: config.window || window,
      stage: 'hydrate',
    }),
  });

  mountHydratedNodes(hNode);
}
