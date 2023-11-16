import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JSXNode} from '../node/node.ts';

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
    parentHNode: options.parent,
    jsxPath: options.jsxPath || '',
    globalCtx: new GlobalCtx({
      window: options.window || window,
      status: 'render',
    }),
  });
};
