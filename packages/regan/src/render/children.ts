import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx} from '../node/render/render.ts';
import {Child, DomPointer, FCStaticParams} from '../types.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {getInsertedCount} from '../utils/inserted-count.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  renderCtx,
  hNodeCtx,
  parentCtx,
  domPointer,
}: {
  domPointer: DomPointer;
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

  let insertedDomCount = domPointer.position;
  let insertedJsxCount = 0;
  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      rawResults.push(childOrAtom);
      insertedDomCount++;
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
      parentDomPointer: {
        parent: domPointer.parent,
        position: insertedDomCount,
      },
      parentHNode,
      globalCtx,
      parentCtx,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxCount,
      },
      jsxSegmentStr: insertedJsxCount.toString(),
      renderCtx,
      hNodeCtx,
    });
    rawResults.push(renderResult);

    const iterateInsertedDomCount = await getInsertedCount(child, renderResult);

    insertedDomCount += iterateInsertedDomCount;
    insertedJsxCount++;
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
    insertedDomCount,
  };
}
