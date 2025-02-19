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
import {
  ContextEnt,
  ContextProvider,
  getContextValue,
} from '../context/context.tsx';
import {HNodeComponent} from '../h-node/component.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {errorContextJsx} from '../errors/errors.tsx';

export async function renderComponent(
  this: JsxNodeComponent,
  props: RenderProps
): RenderResult {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  const hNode = new HNodeComponent({
    segmentEnt,
    globalCtx: props.globalCtx,
    globalClientCtx: props.globalClientCtx,
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
    const errorJsx = getContextValue(errorContextJsx, props.parentContextEnt);

    return new JsxNodeComponent({
      type: errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).render(props);
  }

  let contextEnt: ContextEnt | undefined;
  if (this.type === ContextProvider) {
    contextEnt = {
      value: componentCtx.props.value,
      context: componentCtx.props.context,
      parent: props.parentContextEnt,
    };
  } else {
    contextEnt = props.parentContextEnt;
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
    parentSegmentEnt: segmentEnt,
    parentContextEnt: contextEnt,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
