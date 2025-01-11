import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {GlobalClientCtx, HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../node/node.ts';
import {RenderCtx, RenderTemplateText} from './types.ts';
import {Child} from '../types.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
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

    if (!childOrAtom) {
      continue;
    }

    if (typeof childOrAtom === 'string') {
      rawResults.push({
        renderTemplate: {
          type: 'text',

          vNew: {
            type: 'text',
            text: childOrAtom,
            init: noop,
          },

          createHNode({domNode, start}) {
            return new HNodeText(
              {
                globalCtx,
                globalClientCtx,
                segmentEnt: parentSegmentEnt,
                contextEnt: parentContextEnt,
              },
              {
                textNode: domNode,
                text: childOrAtom,
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
