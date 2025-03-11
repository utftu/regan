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
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  const funcCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    stage: 'string',
    segmentEnt,
    parentContextEnt: props.parentContextEnt,
  });

  let rawChidlren;
  try {
    rawChidlren = this.component(this.props, funcCtx);
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return jsxNodeComponent.stingify(props);
  }

  const children = normalizeChildren(rawChidlren);

  const parentContextEnt = selectContextEnt(this, props.parentContextEnt);

  let handleChildrenResult: HandleChildrenStringifyResult;

  try {
    handleChildrenResult = handleChildrenString({
      children,
      globalCtx: props.globalCtx,
      stringifyContext: props.stringifyContext,
      parentContextEnt,
      parentSegmentEnt: segmentEnt,
    });
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentContextEnt
    );

    return jsxNodeComponent.stingify(props);
  }

  return {
    text: handleChildrenResult.text,
  };
}
