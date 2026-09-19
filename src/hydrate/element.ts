import {HNodeElement} from '../h-node/element.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {
  initStaticProps,
  splitProps,
  subscribeDynamicProps,
} from '../utils/props.ts';
import {
  handleChildrenHydrate,
  HandleChildrenHydrateResult,
} from './children.ts';
import {HydrateProps, HydrateResult} from './types.ts';
import {applyRef} from '../utils/ref.ts';

function isElement<TNode extends ChildNode>(args: {
  element: TNode;
  localWindow: Window;
  jsxNodeElement: JsxNodeElement;
}): args is {
  element: Extract<TNode, Element>;
  localWindow: Window;
  jsxNodeElement: JsxNodeElement;
} {
  const {element, localWindow, jsxNodeElement} = args;

  const NodeCtor = (localWindow as any).Node;

  if (element.nodeType === NodeCtor.ELEMENT_NODE) {
    const el = element as any as Element;

    if (el.tagName.toLowerCase() === jsxNodeElement.tagName.toLowerCase()) {
      return true;
    }

    throw new Error(
      `Tag mismatch: DOM <${el.tagName}> vs JSX <${jsxNodeElement.tagName}>`,
    );
  }

  throw new Error(`Expected Element, got nodeType ${element.nodeType}`);
}

export function hydrateElement(
  this: JsxNodeElement,
  props: HydrateProps,
): HydrateResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    contextEnt: props.parentSegmentEnt?.contextEnt,
    globalCtx: props.globalCtx,
  });
  this.segmentEnt = segmentEnt;

  const element = props.domPointer.parent.childNodes[
    props.domPointer.nodeCount
  ] as Element;

  const {dynamicProps, staticProps, joinedProps} = splitProps(this.props);

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
      tag: this.tagName,
      props: joinedProps,
      listenerManager,
    },
  );
  segmentEnt.hNode = hNode;

  hNode.mounts.push(() => {
    initStaticProps(element, staticProps, listenerManager);
    applyRef(this.systemProps.ref, element);
  });
  hNode.unmounts.push(() => {
    applyRef(this.systemProps.ref, undefined);
  });

  subscribeDynamicProps({
    dynamicProps,
    mounts: hNode.mounts,
    globalCtx: props.globalCtx,
    listenerManager,
  });

  if (this.systemProps.rawHtml) {
    return {
      hNode,
      nodeCount: 1,
    };
  }

  const handlerChildrenResult: HandleChildrenHydrateResult =
    handleChildrenHydrate({
      children: this.children,
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
