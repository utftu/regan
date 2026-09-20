import {HNodeComponent} from '../h-node/component.ts';
import {JsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {getErrorGuardChildren, runComponent} from '../jsx-node/component.ts';
import {SingleChild} from '../types.ts';
import {handleChildrenHydrate} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateComponent(
  jsxNode: JsxNodeComponent,
  props: HydrateProps
): HydrateResult {
  const {segmentEnt, state, children} = runComponent({
    jsxNode,
    props,
    stage: 'hydrate',
  });

  const hNode = new HNodeComponent({
    parent: props.parentHNode,
    globalCtx: props.globalCtx,
    segmentEnt,
    mounts: state.mounts,
    unmounts: state.unmounts,
  });
  segmentEnt.hNode = hNode;

  const handle = (children: SingleChild[]) =>
    handleChildrenHydrate({
      children,
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      areaCtx: props.areaCtx,
      parentDomPointer: props.domPointer,
      parentSegmentEnt: segmentEnt,
    });

  let childrenResult;

  try {
    childrenResult = handle(children);
  } catch (error) {
    childrenResult = handle(getErrorGuardChildren({error, jsxNode, segmentEnt}));
  }

  hNode.addChildren(childrenResult.hNodes);

  return {hNode, nodeCount: childrenResult.nodeCount};
}
