import {GlobalCtx} from '../node/global-ctx/global-ctx.ts';
import {HNode} from '../node/hydrate/hydrate.ts';
import {DomSimpleProps} from '../node/node.ts';
import {Child} from '../types.ts';
import {joinPath} from '../utils.ts';

export function addEventListenerStore({
  listener,
  name,
  elem,
  store,
}: {
  listener: EventListener;
  name: string;
  elem: HTMLElement;
  store: Record<any, any>;
}) {
  if (name in store) {
    elem.removeEventListener(name, store[name]);
  }

  elem.addEventListener(name, listener);
  store[name] = listener;
  return;
}

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
