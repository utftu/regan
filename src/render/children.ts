import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {
  AddElementToParent,
  DomSimpleProps,
  JSXNode,
  RenderCtx,
} from '../node/node.ts';
import {Child} from '../types.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  dom,
  globalCtx,
  parentJsxSegment,
  addElementToParent,
  renderCtx,
}: {
  dom: DomSimpleProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
}) {
  const hNodes: HNode[] = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const child = children[i];
    if (!child) {
      continue;
    }

    if (typeof child === 'string') {
      addElementToParent(child);
      // dom.parent.innerHTML = child;
      continue;
    }

    const renderResult = await (child as JSXNode).render({
      dom: {parent: dom.parent},
      parentHNode,
      globalCtx,
      parentJsxSegment,
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      renderCtx,
      addElementToParent,
    });
    console.log('-----', 'renderResult', renderResult);
    hNodes.push(renderResult.hNode);

    insertedJsxNodeCount++;
  }
  // console.log('-----', 'hNodes', hNodes);

  return {
    hNodes,
  };
}
