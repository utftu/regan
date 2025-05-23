import {createErrorJsxNodeComponent} from '../errors/helpers.ts';
import {HNodeElement} from '../h-node/element.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {
  initDynamicPropsStage0,
  initStaticProps,
  splitProps,
} from '../utils/props.ts';
import {
  handleChildrenHydrate,
  HandleChildrenHydrateResult,
} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateElement(
  this: JsxNodeElement,
  props: HydrateProps
): HydrateResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt: props.parentSegmentEnt?.contextEnt,
  });
  this.segmentEnt = segmentEnt;

  const element = props.domPointer.parent.childNodes[
    props.domPointer.nodeCount
  ] as Element;

  const {dynamicProps, staticProps} = splitProps(this.props);

  const listenerManager = new LisneterManager(segmentEnt);

  const hNode = new HNodeElement(
    {
      globalClientCtx: props.globalClientCtx,
      parent: props.parentHNode,
      globalCtx: props.globalCtx,
      segmentEnt,
    },
    {
      element,
      listenerManager,
    }
  );
  segmentEnt.hNode = hNode;

  hNode.mounts.push(() => {
    initStaticProps(element, staticProps, listenerManager);
  });

  const initDynamicPropsStage1 = initDynamicPropsStage0({
    dynamicProps,
    atomsTracker: props.hydrateCtx.atomsTracker,
  });
  initDynamicPropsStage1(hNode, listenerManager);

  let handlerChildrenResult: HandleChildrenHydrateResult;

  try {
    handlerChildrenResult = handleChildrenHydrate({
      children: this.children,
      parentDomPointer: {
        parent: element,
        nodeCount: 0,
      },
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      hydrateCtx: props.hydrateCtx,
      globalClientCtx: props.globalClientCtx,
      parentSegmentEnt: segmentEnt,
      lastText: false,
    });
  } catch (error) {
    const jsxNodeComponent = createErrorJsxNodeComponent(
      this,
      error,
      props.parentSegmentEnt?.contextEnt
    );

    return jsxNodeComponent.hydrate(props);
  }

  hNode.addChildren(handlerChildrenResult.hNodes);

  return {
    hNode,
    nodeCount: 1,
    lastText: false,
  };
}
