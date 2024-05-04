import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenString} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {GetStringStreamProps} from '../node/string/string.ts';
import {getContextValue} from '../context/context.tsx';
import {errorContext} from '../errors/errors.tsx';
import {StringResult} from '../node/node.ts';

export async function getStringStreamComponent(
  this: JsxNodeComponent,
  ctx: GetStringStreamProps
): StringResult {
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

  const funcCtx = new Ctx({
    globalCtx: ctx.globalCtx,
    jsxSegment: jsxSegment,
    props: this.props,
    systemProps: this.systemProps,
    state,
    children: this.children,
    parentCtx: ctx.parentCtx,
    stage: 'string',
    jsxNodeComponent: this,
  });

  let rawChidlren;
  try {
    debugger;
    rawChidlren = await this.type(this.props, funcCtx);
  } catch (error) {
    const errorHandlerConfig = getContextValue(errorContext, ctx.parentCtx);

    return new JsxNodeComponent({
      type: errorHandlerConfig.errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).getStringStream(ctx);
  }

  const children = normalizeChildren(rawChidlren);

  Promise.resolve().then(async () => {
    await handleChildrenString({
      children,
      streams,
      parentJsxSegment: jsxSegment,
      globalCtx: ctx.globalCtx,
      stringContext: ctx.stringContext,
      parentCtx: funcCtx,
      parentJsxNode: this,
    });
    await streams.writable.close();
  });

  return streams.readable;
}
