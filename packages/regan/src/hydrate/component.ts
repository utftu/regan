import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenHydrate} from './children.ts';
import {ComponentState} from '../h-node/h-node.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {errorContext} from '../errors/errors.tsx';
import {ContextProvider, getContextValue} from '../context/context.tsx';
import {HNodeComponent} from '../h-node/component.ts';
import {HydrateProps, HydrateResult} from './types.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {tryDetectInsertedInfoComponentImmediately} from '../utils/inserted-dom.ts';

export async function hydrateComponent(
  this: JsxNodeComponent,
  props: HydrateProps
): HydrateResult {
  const insertedInfo = tryDetectInsertedInfoComponentImmediately(this);
  if (insertedInfo) {
    props.parentWait.promiseControls.resolve(insertedInfo);
  }

  const hNode = new HNodeComponent({
    globalClientCtx: props.globalClientCtx,
    parent: props.parentHNode,
    globalCtx: props.globalCtx,
    segmentEnt: new SegmentEnt({
      jsxSegmentName: props.jsxSegmentName,
      parentSystemEnt: props.parentSegmentEnt,
      unmounts: [],
      jsxNode: this,
    }),
    contextEnt: null as any,
  });

  const componentCtx = new Ctx({
    client: {
      parentDomPointer: props.domPointer,
      hNode,
    },
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    segmentEnt: hNode.segmentEnt,
    jsxNodeComponent: this,
    stage: 'hydrate',
    parentContextEnt: props.parentContextEnt,
  });

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, componentCtx);
  } catch (error) {
    const errorHandlers = getContextValue(errorContext, props.parentContextEnt);

    return new JsxNodeComponent({
      type: errorHandlers.errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).hydrate(props);
  }

  if (this.type === ContextProvider) {
    hNode.contextEnt = {
      value: componentCtx.props.value,
      context: componentCtx.props.context,
      parent: props.parentContextEnt,
    };
  } else {
    hNode.contextEnt = props.parentContextEnt;
  }

  const smartMount = createSmartMount(componentCtx);
  hNode.unmounts = componentCtx.state.unmounts;
  hNode.mounts.push(smartMount);

  const children = normalizeChildren(rawChidlren);

  const {hNodes} = await handleChildrenHydrate({
    parentInsertedDomNodesPromise: props.parentWait,
    parentHNode: hNode,
    children,
    parentDomPointer: props.domPointer,
    globalCtx: props.globalCtx,
    globalClientCtx: props.globalClientCtx,
    hydrateCtx: props.hydrateCtx,
    parentContextEnt: hNode.contextEnt,
    parentSegmentEnt: hNode.segmentEnt,
  });

  hNode.addChildren(hNodes);

  return {
    hNode,
  };
}
