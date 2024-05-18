import {ComponentState, HNode} from '../h-node/h-node.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {Ctx} from '../ctx/ctx.ts';
import {handleChildrenRender} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {RenderProps} from '../node/render/render.ts';
import {createSmartMount} from '../h-node/helpers.ts';
import {getContextValue} from '../context/context.tsx';
import {errorContext} from '../errors/errors.tsx';
import {RenderResult} from '../node/node.ts';

export async function renderComponent(
  this: JsxNodeComponent,
  ctx: RenderProps
): RenderResult {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const hNode = new HNode({
    parent: ctx.parentHNode,
    jsxSegment,
    globalCtx: ctx.globalCtx,
    hNodeCtx: ctx.hNodeCtx,
  });
  const componentCtx = new Ctx({
    client: {
      parentDomPointer: ctx.parentDomPointer,
      hNode: hNode,
    },
    globalCtx: ctx.globalCtx,
    jsxSegment,
    props: this.props,
    systemProps: this.systemProps,
    state: new ComponentState(),
    children: this.children,
    hNode,
    jsxNodeComponent: this,
    parentCtx: ctx.parentCtx,
    stage: 'render',
  });

  let rawChidlren;
  try {
    rawChidlren = await this.type(this.props, componentCtx);
  } catch (error) {
    const errorHandlers = getContextValue(errorContext, ctx.parentCtx);

    return new JsxNodeComponent({
      type: errorHandlers.errorJsx,
      props: {
        error,
        jsxNode: this,
      },
      systemProps: {},
      children: [],
    }).render(ctx);
  }

  const children = normalizeChildren(rawChidlren);

  const smartMount = createSmartMount(componentCtx);
  hNode.mounts.push(smartMount);
  hNode.unmounts.push(...componentCtx.state.unmounts);

  const {hNodes, rawConnectElements, insertedDomCount} =
    await handleChildrenRender({
      parentHNode: hNode,
      domPointer: ctx.parentDomPointer,
      children,
      globalCtx: ctx.globalCtx,
      parentJsxSegment: jsxSegment,
      renderCtx: ctx.renderCtx,
      hNodeCtx: ctx.hNodeCtx,
      parentCtx: componentCtx,
    });

  hNode.addChildren(hNodes);

  return {
    hNode,
    insertedDomCount,
    connectElements: () => {
      const flatElements: (HTMLElement | string)[] = [];
      rawConnectElements.forEach((child) => {
        if (typeof child === 'function') {
          const elements = child();
          elements.forEach((elem) => {
            flatElements.push(elem);
          });
          return;
        }
        flatElements.push(child);
      });

      return flatElements;
    },
  };
}
