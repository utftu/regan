import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HydratedNode} from '../hydrate/hydrate.ts';
import {Child, DomProps, DomSimpleProps, JSXNode} from '../node.ts';

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
}: {
  dom: DomSimpleProps;
  children: Child[];
  parentHydratedNode?: HydratedNode;
  globalCtx: GlobalCtx;
}) {
  const hydratedNodes: HydratedNode[] = [];

  for (let i = 0; i <= children.length; i++) {
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
    });
    hydratedNodes.push(renderResult.hydratedNode);
  }
  return {
    hydratedNodes,
  };
}

type Options = {
  parent?: HydratedNode;
  window: Window;
  data?: Record<any, any>;
};

export const redner = async (
  domNode: HTMLElement,
  node: JSXNode,
  options: Options
) => {
  return await node.render({
    dom: {parent: domNode},
    globalCtx: new GlobalCtx({
      window: options.window,
      status: 'render',
    }),
  });
};
