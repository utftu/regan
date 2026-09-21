import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {getErrorGuardChildren, runComponent} from '../jsx-node/component.ts';
import {SingleChild} from '../types.ts';
import {handleChildren} from './children.ts';
import {RenderNodeComponent} from './node.ts';
import {RenderProps, RenderResult} from './types.ts';

export function renderComponent(
  jsxNode: JsxNodeComponent,
  props: RenderProps,
): RenderResult {
  const {segmentEnt, state, children} = runComponent({
    jsxNode,
    props,
    stage: 'render',
  });

  const renderNode: RenderNodeComponent = {
    type: 'component',
    segmentEnt,
    globalCtx: props.globalCtx,
    mounts: state.mounts,
    unmounts: state.unmounts,
    children: [],
    oldHNode: props.oldHNode,
  };

  const handle = (children: SingleChild[]) =>
    handleChildren({
      children,
      parentSegmentEnt: segmentEnt,
      globalCtx: props.globalCtx,
      areaCtx: props.areaCtx,
      oldHNodes: props.oldHNode?.children,
    }).renderNodes;

  try {
    renderNode.children = handle(children);
  } catch (error) {
    renderNode.children = handle(
      getErrorGuardChildren({error, jsxNode, segmentEnt}),
    );
  }

  return {renderNode};
}
