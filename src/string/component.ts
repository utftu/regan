import {normalizeChildren} from '../jsx/jsx.ts';
import {JSXNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {GetStringStreamProps} from '../node/node.ts';
import {handleChildrenString} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';

export async function getStringStreamComponent(
  this: JSXNodeComponent,
  ctx: GetStringStreamProps
) {
  const jsxSegment = new JsxSegment(ctx.jsxSegmentStr, ctx.parentJsxSegment);
  const streams = new TransformStream<string, string>();

  const state = {
    mounts: [],
    atoms: [],
  };
  const rawChidlren = await this.type(
    this.props,
    new Ctx({
      globalCtx: ctx.globalCtx,
      jsxSegment: jsxSegment,
      props: this.props,
      state: state,
      children: this.children,
    })
  );

  const children = normalizeChildren(rawChidlren);

  Promise.resolve().then(async () => {
    await handleChildrenString({
      children,
      streams,
      parentJsxSegment: jsxSegment,
      // jsxPath: ctx.jsxPath,
      globalCtx: ctx.globalCtx,
    });
    await streams.writable.close();
  });

  return streams.readable;
}
