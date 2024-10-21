import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenHydrate} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {HydrateProps, HydrateResult} from '../node/hydrate/hydrate.ts';
import {HNodeElement} from '../h-node/element.ts';
import {defaultDomNodesInfo} from '../consts.ts';
import {
  detachDynamicProps,
  // handleProps,
  initDynamicSubsribes,
  initStaticProps,
  prepareDynamicProps,
} from '../utils/props/props.ts';

export async function hydrateElement(
  this: JsxNodeElement,
  props: HydrateProps
): HydrateResult {
  props.parentWait.promiseControls.resolve(defaultDomNodesInfo);
  const jsxSegment = new JsxSegment({
    name: props.jsxSegmentStr,
    parent: props.parentJsxSegment,
  });

  const element = (props.domPointer.parent as Element).children[
    props.domPointer.position
  ] as HTMLElement;

  const {dynamicProps, staticProps} = handleProps({
    props: this.props,
  });

  const dynamicPropsEnt = prepareDynamicProps({
    props: dynamicProps,
    jsxNode: this,
    element,
    ctx: props.parentCtx,
    globalCtx: props.globalCtx,
  });

  const hNode = new HNodeElement(
    {
      hNodeCtx: props.hNodeCtx,
      jsxSegment,
      mounts: [() => detachDynamicProps(dynamicPropsEnt)],
      unmounts: [],
      parent: props.parentHNode,
      globalCtx: props.globalCtx,
    },
    {
      element,
      jsxNode: this,
      dynamicPropsEnt: dynamicPropsEnt,
    }
  );

  initStaticProps(element, staticProps);

  initDynamicSubsribes({
    dynamicPropsEnt,
    hNode,
    globalCtx: props.globalCtx,
    changedAtoms: props.hCtx.changedAtoms,
  });

  const {hNodes} = await handleChildrenHydrate({
    atomDescendant: props.atomDescendant,
    atomDirectNode: false,
    parentInsertedDomNodesPromise: props.parentWait,
    parentJsxSegment: jsxSegment,
    hNodeCtx: props.hNodeCtx,
    children: this.children,
    parentDomPointer: {
      parent: element,
      position: 0,
    },
    parentHNode: hNode,
    parentCtx: props.parentCtx,
    globalCtx: props.globalCtx,
    hCtx: props.hCtx,
  });

  hNode.addChildren(hNodes);

  return {
    hNode,
  };
}
