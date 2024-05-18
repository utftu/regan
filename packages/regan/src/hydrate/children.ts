import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {DomProps, JsxNode} from '../node/node.ts';
import {Child, DomPointer, FCStaticParams} from '../types.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {HCtx} from '../node/hydrate/hydrate.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {Fragment} from '../components/fragment/fragment.ts';

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
  let insertedDomCount = parentDomPointer.position;
  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

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
        position: insertedDomCount,
      },
      // dom: {parent: dom.parent, position},
      parentHNode,
      globalCtx,
      parentCtx,
      hCtx: hContext,
      hNodeCtx,
    });
    hydrateResults.push(hydrateResult);

    if (child instanceof JsxNodeElement) {
      insertedDomCount++;
    } else if (child instanceof JsxNodeComponent) {
      if (
        child.systemProps.needAwait === true ||
        (child.type as FCStaticParams)[NEED_AWAIT] === true
      ) {
        const awaitedhResult = await hydrateResult;
        insertedDomCount += awaitedhResult.insertedDomCount;
      } else if ('insertedTagsCount' in child.systemProps) {
        insertedDomCount += child.systemProps.insertedTagsCount!;
      } else if (INSERTED_TAGS_COUNT in child.type) {
        insertedDomCount += child.type[INSERTED_TAGS_COUNT] as number;
      } else {
        insertedDomCount++;
      }
    }

    insertedJsxCount++;
  }

  const hydrateResultsData = await Promise.all(hydrateResults);

  return {
    insertedDomCount: insertedDomCount - parentDomPointer.position,
    hNodes: hydrateResultsData.map(({hNode}) => {
      return hNode;
    }),
  };
}
