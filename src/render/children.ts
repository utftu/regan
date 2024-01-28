import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx} from '../node/render/render.ts';
import {Child} from '../types.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  renderCtx,
  hNodeCtx,
  parentCtx,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
}) {
  const hNodes: HNode[] = [];
  const rawResults = [];

  for (let i = 0, insertedJsxNodeCount = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      rawResults.push(childOrAtom);
      continue;
    }

    let child: JsxNode;
    if (childOrAtom instanceof Atom) {
      child = new JsxNodeComponent({
        type: AtomWrapper,
        children: [],
        props: {
          atom: childOrAtom,
        },
        systemProps: {},
      });
    } else if (Array.isArray(childOrAtom)) {
      child = new JsxNodeComponent({
        type: Fragment,
        children: childOrAtom,
        props: {},
        systemProps: {},
      });
    } else {
      child = childOrAtom;
    }

    const renderResult = child.render({
      parentHNode,
      globalCtx,
      parentCtx,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxNodeCount,
      },
      jsxSegmentStr: insertedJsxNodeCount.toString(),
      renderCtx,
      hNodeCtx,
    });
    rawResults.push(renderResult);

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
