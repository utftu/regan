import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenString} from './children.ts';
import {ContextProvider, selectContextEnt} from '../context/context.tsx';
import {createErrorJsxNodeComponent} from '../errors/errors.tsx';
import {StringResult} from '../node/node.ts';
import {GetStringStreamProps} from './types.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';

export async function getStringStreamComponent(
  this: JsxNodeComponent,
  props: GetStringStreamProps
): StringResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSystemEnt: props.parentSegmentEnt,
    unmounts: [],
    jsxNode: this,
  });
  const streams = new TransformStream<string, string>();

  const state = {
    mounts: [],
    atoms: [],
    unmounts: [],
  };

  const funcCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state,
    children: this.children,
    stage: 'string',
    jsxNodeComponent: this,
    segmentEnt,
    parentContextEnt: props.parentContextEnt,
  });

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, funcCtx);
  } catch (error) {
    const errorJsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return errorJsxNodeComponent.getStringStream(props);
  }

  const children = normalizeChildren(rawChidlren);

  // console.log(
  //   '-----',
  //   'this.type === ContextProvider',
  //   this.type === ContextProvider,
  //   this.type
  // );
  // console.log('-----', 'rawChildren', rawChidlren);
  // console.log('-----', 'children', children);
  const parentContextEnt = selectContextEnt(this, props.parentContextEnt);

  Promise.resolve().then(async () => {
    await handleChildrenString({
      children,
      streams,
      globalCtx: props.globalCtx,
      stringContext: props.stringContext,
      parentContextEnt,
      parentSegmentEnt: segmentEnt,
    });
    await streams.writable.close();
  });

  return streams.readable;
}
