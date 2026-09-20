import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {getErrorGuardChildren, runComponent} from '../jsx-node/component.ts';
import {SingleChild} from '../types.ts';
import {handleChildrenString} from './children.ts';
import {StringifyProps, StringifyResult} from './types.ts';

export function stringifyComponent(
  jsxNode: JsxNodeComponent,
  props: StringifyProps
): StringifyResult {
  const {segmentEnt, children} = runComponent({
    jsxNode,
    props,
    stage: 'string',
  });

  const handle = (children: SingleChild[]) =>
    handleChildrenString({
      children,
      parentSegmentEnt: segmentEnt,
      globalCtx: props.globalCtx,
      areaCtx: props.areaCtx,
      lastText: props.lastText,
    });

  try {
    return handle(children);
  } catch (error) {
    return handle(getErrorGuardChildren({error, jsxNode, segmentEnt}));
  }
}
