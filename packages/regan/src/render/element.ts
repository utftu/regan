import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps} from '../node/render/render.ts';
import {defaultDomNodesInfo} from '../consts.ts';
import {HNodeElementToReplace} from '../v/h-node.ts';
import {
  detachDynamicProps,
  handleProps,
  initDynamicProps,
  prepareDynamicProps,
} from '../utils/props/props.ts';
import {HNodeElement} from '../h-node/element.ts';

export async function renderElement(this: JsxNodeElement, props: RenderProps) {
  props.parentWait.promiseControls.resolve(defaultDomNodesInfo);
  const jsxSegment = new JsxSegment({
    segment: props.jsxSegmentStr,
    parent: props.parentJsxSegment,
  });

  const {dynamicProps} = handleProps({props: this.props});

  const hNode = new HNodeElementToReplace(
    {
      unmounts: [],
      mounts: [],
      jsxSegment,
      parent: props.parentHNode,
      globalCtx: props.globalCtx,
      hNodeCtx: props.hNodeCtx,
    },
    {
      jsxNode: this,
      init: (element: HTMLElement) => {
        const dynamicPropsEnt = prepareDynamicProps({
          props: dynamicProps,
          jsxNode: this,
          ctx: props.parentCtx,
          element,
          globalCtx: props.globalCtx,
        });

        for (const name in dynamicPropsEnt) {
          const dynamicPropEnt = dynamicPropsEnt[name];
          const atomtValue = dynamicPropEnt.atom.get();

          if (typeof atomtValue === 'function') {
            dynamicPropEnt.listener = atomtValue;
          }
        }

        initDynamicProps({
          dynamicPropsEnt,
          hNode,
          changedAtoms: props.renderCtx.changedAtoms,
          globalCtx: props.globalCtx,
        });

        hNode.unmounts.push(() => detachDynamicProps(dynamicPropsEnt));

        const newHNode = new HNodeElement(
          {
            jsxSegment,
            globalCtx: props.globalCtx,
            hNodeCtx: props.hNodeCtx,
          },
          {
            element,
            jsxNode: this,
            dynamicPropsEnt,
          }
        );
        if (props.parentHNode) {
          props.parentHNode.children[props.hNodePosition!] = newHNode;
        }
      },
    }
  );

  const {hNodes} = await handleChildrenRender({
    parentPosition: 0,
    children: this.children,
    parentHNode: hNode,
    globalCtx: props.globalCtx,
    parentJsxSegment: jsxSegment,
    renderCtx: props.renderCtx,
    hNodeCtx: props.hNodeCtx,
    parentCtx: props.parentCtx,
    parentWait: props.parentWait,
  });
  hNode.addChildren(hNodes);

  return {
    hNode,
  };
}
