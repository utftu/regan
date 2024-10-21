import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps, RenderTemplate, RenderTemplateElement} from './types.ts';
import {defaultDomNodesInfo, noop} from '../consts.ts';
import {initDynamicSubsribes} from '../utils/props/props.ts';
import {splitProps} from '../v/convert/convert.ts';
import {subscribeWithAutoRemove} from '../h-node/helpers.ts';

export async function renderElement(this: JsxNodeElement, props: RenderProps) {
  // props.parentWait.promiseControls.resolve(defaultDomNodesInfo);
  const jsxSegment = new JsxSegment(props.jsxSegmentWrapper);

  const {dynamicProps, joinedProps} = splitProps(this.props);

  const renderTemplate = {
    type: 'element',
    vNew: {
      type: 'element',
      tag: this.type,
      props: joinedProps,
      init: noop,
      children: [],
    },
    jsxSegment,
    jsxNode: this,
    init: (hNode, vOld) => {
      // all props inited by virtual dom

      initDynamicSubsribes({
        hNode,
        dynamicProps,
        changedAtoms: props.renderCtx.changedAtoms,
        ctx: props.parentCtx,
        jsxNode: this,
      });

      for (const name in dynamicProps) {
        const atom = dynamicProps[name];

        subscribeWithAutoRemove({
          hNode,
          atom,
          listener: (newValue) => {
            vOld.props[name] = newValue;
          },
        });
      }
    },
    children: [] as RenderTemplate[],
  } satisfies RenderTemplateElement;

  const {renderTemplates} = await handleChildrenRender({
    // parentPosition: 0,
    children: this.children,
    globalCtx: props.globalCtx,
    parentJsxSegment: jsxSegment,
    renderCtx: props.renderCtx,
    hNodeCtx: props.hNodeCtx,
    parentCtx: props.parentCtx,
    // parentWait: props.parentWait,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplates,
  };
}
