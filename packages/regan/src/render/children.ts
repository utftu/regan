import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {GlobalClientCtx, HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx, RenderTemplateText} from './types.ts';
import {Child} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {noop} from '../consts.ts';
import {HNodeText} from '../h-node/text.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {ContextEnt} from '../context/context.tsx';

export async function handleChildrenRender({
  children,
  globalCtx,
  renderCtx,
  globalClientCtx,
  parentSegmentEnt,
  parentContextEnt,
}: {
  children: Child[];
  parentHNode?: HNode;
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  parentSegmentEnt: SegmentEnt;
  parentContextEnt: ContextEnt;
  renderCtx: RenderCtx;
}) {
  const rawResults: (
    | ReturnType<JsxNode['render']>
    | {renderTemplate: RenderTemplateText}
  )[] = [];

  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      rawResults.push({
        renderTemplate: {
          type: 'text',

          vNew: {
            type: 'text',
            data: {
              text,
            },
          },

          createHNode({domNode, start}) {
            return new HNodeText(
              {
                globalCtx,
                globalClientCtx,
                segmentEnt: parentSegmentEnt,
              },
              {
                textNode: domNode,
                text,
                start,
              }
            );
          },
        } satisfies RenderTemplateText,
      });

      continue;
    }

    const child = wrapChildIfNeed(childOrAtom);

    const renderResult = child.render({
      globalCtx,
      globalClientCtx,
      renderCtx,
      jsxSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      parentContextEnt,
    });
    rawResults.push(renderResult);

    insertedJsxCount++;
  }

  const renderResults = await Promise.all(rawResults);

  return {
    renderTemplates: renderResults.map(({renderTemplate}) => {
      return renderTemplate;
    }),
  };
}
