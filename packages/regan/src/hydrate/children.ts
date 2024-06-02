import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child, DomPointer} from '../types.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {InsertedDomNodes, getInsertedCount} from '../utils/inserted-dom.ts';

export async function handleChildrenHydrate({
  children,
  parentHNode,
  // dom,
  globalCtx,
  parentJsxSegment,
  hCtx: hContext,
  hNodeCtx,
  parentCtx,
  parentDomPointer,
}: {
  // dom: DomProps;
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  hCtx: HCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  parentDomPointer: DomPointer;
}) {
  const hydrateResults: ReturnType<JsxNode['hydrate']>[] = [];
  const insertedDomNodes: InsertedDomNodes = [];
  // let insertedDomCount = parentDomPointer.position;
  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (typeof childOrAtom === 'string') {
      insertedDomNodes.push({
        type: 'text',
        length: childOrAtom.length,
      });
    }

    if (!(childOrAtom instanceof JsxNode) && !(childOrAtom instanceof Atom)) {
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

    const hydrateResult = child.hydrate({
      jsxSegmentStr: `${insertedJsxCount}`,
      parentJsxSegment: {
        jsxSegment: parentJsxSegment,
        position: insertedJsxCount,
      },
      domPointer: {
        parent: parentDomPointer.parent,
        position: parentDomPointer.position + insertedDomNodes.length,
        // position: insertedDomCount,
      },
      // dom: {parent: dom.parent, position},
      parentHNode,
      globalCtx,
      parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    const insertedDomNodesLocal = await getInsertedCount(child, hydrateResult);

    insertedDomNodes.push(...insertedDomNodesLocal);

    // insertedDomCount += insertedDomNodeCount;
    insertedJsxCount++;
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedDomNodes,
    // insertedDomCount: insertedDomCount - parentDomPointer.position,
    hNodes: hydrateResultsData.map(({hNode}) => {
      return hNode;
    }),
  };
}
