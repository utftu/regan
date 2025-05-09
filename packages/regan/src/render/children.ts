import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {Child} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {HNodeText} from '../h-node/text.ts';
import {RenderCtx} from './types.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderTemplate, RenderTemplateText} from './template.types.ts';
import {handleCommonError} from '../errors/helpers.ts';

export type HandleChildrenResult = {
  renderTemplates: RenderTemplate[];
};

export function handleChildren({
  children,
  globalCtx,
  renderCtx,
  globalClientCtx,
  parentSegmentEnt,
}: {
  children: Child[];
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  parentSegmentEnt: SegmentEnt;
  renderCtx: RenderCtx;
}) {
  const renderTemplates: RenderTemplate[] = [];

  let insertedJsxCount = 0;

  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      const renderTemplateText: RenderTemplateText = {
        type: 'text',

        vNew: {
          type: 'text',
          data: {
            text,
          },
        },

        createHNode(vOld) {
          return new HNodeText(
            {
              globalCtx,
              globalClientCtx,
              segmentEnt: parentSegmentEnt,
            },
            {
              text,
              textNode: vOld.textNode,
            }
          );
        },
      };
      renderTemplates.push(renderTemplateText);

      continue;
    }

    if (checkAllowedStructure(childOrAtom) === false) {
      handleCommonError('Invalid structura', parentSegmentEnt);
      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const {renderTemplate} = jsxNode.render({
      globalCtx,
      globalClientCtx,
      renderCtx,
      jsxSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
    });
    renderTemplates.push(renderTemplate);

    insertedJsxCount++;
  }

  return {
    renderTemplates,
  };
}
