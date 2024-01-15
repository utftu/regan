import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenString} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {GetStringStreamProps} from '../node/string/string.ts';

export async function getStringStreamComponent(
  this: JsxNodeComponent,
  ctx: GetStringStreamProps
) {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const streams = new TransformStream<string, string>();

  const state = {
    mounts: [],
    atoms: [],
    unmounts: [],
  };

  const rawChidlren = await this.type(
    this.props,
    new Ctx({
      globalCtx: ctx.globalCtx,
      jsxSegment: jsxSegment,
      props: this.props,
      systemProps: this.systemProps,
      state,
      children: this.children,
      stage: 'string',
    })
  );

  const children = normalizeChildren(rawChidlren);

  Promise.resolve().then(async () => {
    await handleChildrenString({
      children,
      streams,
      parentJsxSegment: jsxSegment,
      globalCtx: ctx.globalCtx,
      stringContext: ctx.stringContext,
    });
    await streams.writable.close();
  });

  return streams.readable;
}
