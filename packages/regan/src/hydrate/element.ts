import {createErrorJsxNodeComponent} from '../errors/helpers.ts';
import {HNodeElement} from '../h-node/element.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {
  planSubsribeDynamic,
  setStaticProps,
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

  const element = props.domPointer.parent.children[
    props.domPointer.elementsCount
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

  hNode.mounts.push(() => {
    setStaticProps(element, staticProps, listenerManager);
  });

  planSubsribeDynamic({
    hNode,
    dynamicProps,
    listenerManager,
    atomsTracker: props.hydrateCtx.atomTracker,
  });

  let handlerChildrenResult: HandleChildrenHydrateResult;

  try {
    handlerChildrenResult = handleChildrenHydrate({
      children: this.children,
      parentDomPointer: {
        parent: element,
        elementsCount: 0,
      },
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      hydrateCtx: props.hydrateCtx,
      globalClientCtx: props.globalClientCtx,
      parentSegmentEnt: segmentEnt,
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
    elementsCount: 1,
  };
}
