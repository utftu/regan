import {ComponentState} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenRender} from './children.ts';
import {
  RenderProps,
  RenderResult,
  RenderTemplate,
  RenderTemplateComponent,
} from './types.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {ContextProvider, getContextValue} from '../context/context.tsx';
import {errorContext} from '../errors/errors.tsx';
import {HNodeComponent} from '../h-node/component.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';

export async function renderComponent(
  this: JsxNodeComponent,
  props: RenderProps
): RenderResult {
  const hNode = new HNodeComponent({
    segmentEnt: new SegmentEnt({
      jsxSegmentName: props.jsxSegmentName,
      parentSystemEnt: props.parentSegmentEnt,
      unmounts: [],
      jsxNode: this,
    }),
    globalCtx: props.globalCtx,
    globalClientCtx: props.globalClientCtx,
    contextEnt: null as any,
  });
  const componentCtx = new Ctx({
    globalCtx: props.globalCtx,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    jsxNodeComponent: this,
    stage: 'render',
    segmentEnt: hNode.segmentEnt,
    parentContextEnt: props.parentContextEnt,
  });

  const renderTemplate: RenderTemplateComponent = {
    type: 'component',
    children: [] as RenderTemplate[],
    createHNode: () => {
      return hNode;
    },
    connectHNode({children}) {
      hNode.children = children;
      children.forEach((child) => {
        child.parent = hNode;
      });
    },
  };

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, componentCtx);
  } catch (error) {
    const errorHandlers = getContextValue(errorContext, props.parentContextEnt);

    return new JsxNodeComponent({
      type: errorHandlers.errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).render(props);
  }

  if (this.type === ContextProvider) {
    hNode.contextEnt = {
      value: componentCtx.props.value,
      context: componentCtx.props.context,
      parent: props.parentContextEnt,
    };
  } else {
    hNode.contextEnt = props.parentContextEnt;
  }

  const children = normalizeChildren(rawChidlren);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);
  hNode.unmounts.push(...componentCtx.state.unmounts);

  const {renderTemplates} = await handleChildrenRender({
    parentHNode: hNode,
    children,
    globalClientCtx: props.globalClientCtx,
    globalCtx: props.globalCtx,
    renderCtx: props.renderCtx,
    parentSegmentEnt: hNode.segmentEnt,
    parentContextEnt: hNode.contextEnt,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
