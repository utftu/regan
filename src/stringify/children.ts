import {createErrorRegan} from '../errors/errors.tsx';
import {AreaCtx, GlobalCtxServer} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {StringifyCtx} from './types.ts';
import {textSeparator} from '../consts.ts';

export type HandleChildrenStringifyResult = {
  text: string;
  lastText: boolean;
};

export function handleChildrenString({
  children,
  parentSegmentEnt,
  stringifyCtx,
  lastText: propsLastText,
}: {
  children: SingleChild[];
  parentSegmentEnt: SegmentEnt;
  stringifyCtx: StringifyCtx;
  lastText: boolean;
}): HandleChildrenStringifyResult {
  let insertedJsxCount = 0;
  let lastText = propsLastText;

  const strings: string[] = [];
  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      if (lastText === true) {
        strings.push(textSeparator);
      }

      strings.push(text);
      lastText = true;

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

    const stringifyResult = jsxNode.stringify({
      stringifyCtx,
      pathSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      lastText,
    });

    insertedJsxCount++;
    strings.push(stringifyResult.text);
    lastText = stringifyResult.lastText;
  }

  return {
    text: strings.join(''),
    lastText,
  };
}
