import {AreaCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {Root} from '../root/root.ts';

export function stringify(node: JsxNode) {
  const areaCtx = new AreaCtx();

  try {
    const {text} = node.stingify({
      globalCtx: new GlobalCtx({
        mode: 'server',
        data: {},
        root: new Root(),
      }),
      pathSegmentName: '',
      stringifyContext: {},
      areaCtx,
    });

    return text;
  } finally {
    areaCtx.updaterInit.cancel();
  }
}
