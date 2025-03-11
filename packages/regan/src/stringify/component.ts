import {normalizeChildren} from '../jsx/jsx.ts';
import {selectContextEnt} from '../context/context.tsx';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {StringifyProps, StringifyResult} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {ComponentState, Ctx} from '../ctx/ctx.ts';
import {
  handleChildrenString,
  HandleChildrenStringifyResult,
} from './children.ts';
import {createErrorJsxNodeComponent} from '../errors/helpers.ts';

export function strigifyComponent(
  this: JsxNodeComponent,
  props: StringifyProps
): StringifyResult {
  const contextEnt = selectContextEnt(this, props.parentSegmentEnt?.contextEnt);

  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt,
  });

  const funcCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    stage: 'string',
    segmentEnt,
    contextEnt,
  });

  let rawChidlren;
  try {
    rawChidlren = this.component(this.props, funcCtx);
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      contextEnt
    );

    return jsxNodeComponent.stingify(props);
  }

  const children = normalizeChildren(rawChidlren);

  let handleChildrenResult: HandleChildrenStringifyResult;

  try {
    handleChildrenResult = handleChildrenString({
      children,
      globalCtx: props.globalCtx,
      stringifyContext: props.stringifyContext,
      parentSegmentEnt: segmentEnt,
    });
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      contextEnt
    );

    return jsxNodeComponent.stingify(props);
  }

  return {
    text: handleChildrenResult.text,
  };
}
