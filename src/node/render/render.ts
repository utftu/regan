import {Child} from '../../types.ts';
import {joinPath} from '../../utils.ts';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../hydrate/hydrate.ts';
import {DomSimpleProps, JSXNode} from '../node.ts';

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

type Options = {
  jsxPath?: string;
  parent?: HNode;
  window?: Window;
  data?: Record<any, any>;
};

export const redner = async (
  domNode: HTMLElement,
  node: JSXNode,
  options: Options
) => {
  return await node.render({
    dom: {parent: domNode},
    parentHydratedNode: options.parent,
    jsxPath: options.jsxPath || '',
    globalCtx: new GlobalCtx({
      window: options.window || window,
      status: 'render',
    }),
  });
};
