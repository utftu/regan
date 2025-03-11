import {HNodeElement} from '../h-node/element.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {
  initDynamicSubsribes,
  initStaticProps,
  splitProps,
} from '../utils/props.ts';
import {handleChildrenHydrate} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';

export function hydrateElement(
  this: JsxNodeElement,
  props: HydrateProps
): HydrateResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  const element = props.domPointer.parent.childNodes[
    props.domPointer.elementsCount
  ] as HTMLElement;

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

  initStaticProps(element, staticProps, listenerManager);

  initDynamicSubsribes({
    hNode,
    dynamicProps,
    listenerManager,
  });

  const {hNodes} = handleChildrenHydrate({
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
    parentContextEnt: props.parentContextEnt,
  });

  hNode.addChildren(hNodes);

  return {
    hNode,
    elementsCount: 1,
  };
}
