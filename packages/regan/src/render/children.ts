import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeBase, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx} from '../node/render/render.ts';
import {Child, DomPointerElement} from '../types.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {
  createInsertedDomNodePromise,
  getInsertedCount,
} from '../utils/inserted-dom.ts';
import {HNodeText} from '../h-node/text.ts';
import {ParentWait} from '../node/hydrate/hydrate.ts';
import {getPrevTextNode} from '../utils/dom.ts';

export async function handleChildrenRender({
  children,
  parentHNode,
  globalCtx,
  parentJsxSegment,
  renderCtx,
  hNodeCtx,
  parentCtx,
  parentPosition,
}: // domPointer,
{
  // domPointer: DomPointerElement;
  parentPosition: number;
  children: Child[];
  parentHNode?: HNodeBase;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  parentWait: ParentWait;
}) {
  const rawResults: (ReturnType<JsxNode['render']> | HNode)[] = [];

  let position = parentPosition;
  let textLength = 0;
  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      // const textNode = getPrevTextNode(
      //   hNodeCtx.window,
      //   domPointer.parent,
      //   position
      // )!;
      let textNodeStart = textLength;
      textLength += childOrAtom.length;

      // const hNode = new HNodeText(
      //   {
      //     jsxSegment: parentJsxSegment,
      //     globalCtx: globalCtx,
      //     hNodeCtx: hNodeCtx,
      //   },
      //   {
      //     domNode: textNode,
      //     start: textNodeStart,
      //     finish: textNodeStart + childOrAtom.length,
      //   }
      // );

      continue;
    }

    const child = wrapChildIfNeed(childOrAtom);

    const insertedDomNodesPromise = createInsertedDomNodePromise();

    const renderResult = child.render({
      hNodePosition:
        parentHNode && parentHNode?.children.length + rawResults.length,
      parentPosition: position,
      parentWait: insertedDomNodesPromise,
      // parentDomPointer: {
      //   parent: domPointer.parent,
      //   position: position,
      // },
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

    const insertedCount = await getInsertedCount(
      child,
      insertedDomNodesPromise.promise
    );

    position += insertedCount.elemsCount;
    textLength += insertedCount.textLength;

    insertedJsxCount++;
  }

  const renderResults = await Promise.all(rawResults);

  return {
    hNodes: renderResults.map((value) => {
      if (value instanceof HNodeBase) {
        return value;
      }
      return value.hNode;
    }),
  };
}
