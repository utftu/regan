import {HNodeElement} from '../h-node/element.ts';
import {JsxNodeElement} from '../jsx-node/jsx-node.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {
  initStaticProps,
  splitProps,
  subscribeBindProps,
  subscribeDynamicProps,
} from '../utils/props.ts';
import {
  handleChildrenHydrate,
  HandleChildrenHydrateResult,
} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';
import {applyRef} from '../utils/ref.ts';

export function hydrateElement(
  jsxNode: JsxNodeElement,
  props: HydrateProps,
): HydrateResult {
  const segmentEnt = new SegmentEnt({
    name: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.globalCtx,
  });
  jsxNode.segmentEnt = segmentEnt;

  const element = props.domPointer.parent.childNodes[
    props.domPointer.nodeCount
  ] as Element;

  const {dynamicProps, staticProps, joinedProps, bindProps} = splitProps(
    jsxNode.props,
  );

  const listenerManager = new ListenerManager(segmentEnt);

  const hNode = new HNodeElement(
    {
      // globalClientCtx: props.globalClientCtx,
      parent: props.parentHNode,
      globalCtx: props.globalCtx,
      segmentEnt,
    },
    {
      element,
      tag: jsxNode.tagName,
      props: joinedProps,
      listenerManager,
    },
  );
  segmentEnt.hNode = hNode;

  hNode.mounts.push(() => {
    initStaticProps(element, staticProps, listenerManager);
    applyRef(jsxNode.systemProps.ref, element);
  });
  hNode.unmounts.push(() => {
    applyRef(jsxNode.systemProps.ref, undefined);
  });

  subscribeDynamicProps({
    dynamicProps,
    mounts: hNode.mounts,
    globalCtx: props.globalCtx,
    listenerManager,
  });
  subscribeBindProps({bindProps, mounts: hNode.mounts});

  if (jsxNode.systemProps.rawHtml) {
    return {
      hNode,
      nodeCount: 1,
    };
  }

  const handlerChildrenResult: HandleChildrenHydrateResult =
    handleChildrenHydrate({
      children: jsxNode.children,
      parentDomPointer: {
        parent: element,
        nodeCount: 0,
      },
      parentHNode: hNode,
      globalCtx: props.globalCtx,
      parentSegmentEnt: segmentEnt,
      areaCtx: props.areaCtx,
    });

  hNode.addChildren(handlerChildrenResult.hNodes);

  return {
    hNode,
    nodeCount: 1,
  };
}
