import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JSXNode} from '../node/node.ts';
import {AddElementToParent, RenderCtx} from '../node/render/render.ts';
import {Child} from '../types.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {formatJsxValue} from '../utils/jsx.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  addElementToParent,
  renderCtx,
  hNodeCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  addElementToParent: AddElementToParent;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
}) {
  const hNodes: HNode[] = [];
  const rawResults = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      // addElementToParent(childOrAtom);
      rawResults.push(childOrAtom);
      continue;
    }

    let child: JSXNode;
    if (childOrAtom instanceof Atom) {
      child = new JsxNodeComponent({
        type: AtomWrapper,
        children: [],
        props: {
          atom: childOrAtom,
        },
        systemProps: {},
      });
    } else {
      child = childOrAtom;
    }

    const renderResult = child.render({
      parentHNode,
      globalCtx,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxNodeCount,
      },
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      renderCtx,
      addElementToParent,
      hNodeCtx,
    });
    rawResults.push(renderResult);

    // const renderResult = await (child as JSXNode).render({
    //   parentHNode,
    //   globalCtx,
    //   parentJsxSegment: {
    //     jsxSegment: parentJsxSegment,
    //     position: insertedJsxNodeCount,
    //   },
    //   jsxSegmentStr: insertedJsxNodeCount.toString(),
    //   renderCtx,
    //   addElementToParent,
    //   hNodeCtx,
    // });
    // hNodes.push(renderResult.hNode);

    insertedJsxNodeCount++;
  }

  const results = await Promise.all(rawResults);

  const rawConnectElements = results.map((value) => {
    if (typeof value === 'string') {
      return value;
    }

    const {hNode, connectElements} = value;
    hNodes.push(hNode);
    return connectElements;
  });

  return {
    hNodes,
    rawConnectElements,
  };
}
