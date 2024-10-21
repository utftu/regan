import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNodeBase, HNodeCtx} from '../h-node/h-node.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx, RenderTemplateText} from './types.ts';
import {Child} from '../types.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
import {Ctx} from '../ctx/ctx.ts';
import {
  createInsertedDomNodePromise,
  getInsertedCount,
} from '../utils/inserted-dom.ts';
import {ParentWait} from '../node/hydrate/hydrate.ts';

export async function handleChildrenRender({
  children,
  globalCtx,
  parentJsxSegment,
  renderCtx,
  hNodeCtx,
  parentCtx,
}: // parentPosition,
{
  // parentPosition: number;
  children: Child[];
  parentHNode?: HNodeBase;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  // parentWait: ParentWait;
}) {
  const rawResults: (
    | ReturnType<JsxNode['render']>
    | {renderTemplate: RenderTemplateText}
  )[] = [];

  // let position = parentPosition;
  // let textLength = 0;
  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      rawResults.push({
        renderTemplate: {
          type: 'text',
          text: childOrAtom,
          jsxSegment: new JsxSegment({
            name: insertedJsxCount.toString(),
            parent: parentJsxSegment.parent,
          }),
        } satisfies RenderTemplateText,
      });

      continue;
    }

    const child = wrapChildIfNeed(childOrAtom);

    // const insertedDomNodesPromise = createInsertedDomNodePromise();

    const renderResult = child.render({
      // parentPosition: position,
      // parentWait: insertedDomNodesPromise,
      globalCtx,
      parentCtx,
      jsxSegmentWrapper: {
        parent: parentJsxSegment,
        name: insertedJsxCount.toString(),
      },
      // parentJsxSegment: {
      //   jsxSegment: parentJsxSegment,
      //   position: insertedJsxCount,
      // },
      // jsxSegmentStr: insertedJsxCount.toString(),
      renderCtx,
      hNodeCtx,
    });
    rawResults.push(renderResult);

    // const insertedCount = await getInsertedCount(
    //   child,
    //   insertedDomNodesPromise.promise
    // );

    // position += insertedCount.elemsCount;
    // textLength += insertedCount.textLength;

    insertedJsxCount++;
  }

  const renderResults = await Promise.all(rawResults);

  return {
    renderTemplates: renderResults.map(({renderTemplate}) => {
      return renderTemplate;
    }),
  };
}
