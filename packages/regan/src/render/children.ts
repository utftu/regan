import {AreaCtx, GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SingleChild} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {HNodeText} from '../h-node/text.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {RenderT, RenderTemplateText} from './template.types.ts';
import {createErrorRegan} from '../errors/errors.tsx';
import {RenderCtx} from './types.ts';

export type HandleChildrenResult = {
  renderTemplates: RenderT[];
};

export function handleChildren({
  children,
  parentSegmentEnt,
  renderCtx,
}: {
  children: SingleChild[];
  renderCtx: RenderCtx;
  parentSegmentEnt: SegmentEnt;
}) {
  const renderTemplates: RenderT[] = [];

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
              globalCtx: renderCtx.globalCtx,
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
      const errorRegan = createErrorRegan({
        error: `Invalid structura: ${childOrAtom}`,
        place: 'jsx',
        segmentEnt: parentSegmentEnt,
      });

      throw errorRegan;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const {renderTemplate} = jsxNode.render({
      jsxSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      renderCtx,
    });
    renderTemplates.push(renderTemplate);

    insertedJsxCount++;
  }

  return {
    renderTemplates,
  };
}
