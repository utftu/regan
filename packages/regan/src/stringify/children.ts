import {ContextEnt} from '../context/context.tsx';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {Child} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';
import {StringifyContext} from './types.ts';

export type HandleChildrenStringifyResult = {
  text: string;
};

export function handleChildrenString({
  children,
  globalCtx,
  stringifyContext,
  parentSegmentEnt,
}: {
  children: Child[];
  globalCtx: GlobalCtx;
  stringifyContext: StringifyContext;
  parentSegmentEnt: SegmentEnt | undefined;
}): HandleChildrenStringifyResult {
  let insertedJsxCount = 0;

  const strings: string[] = [];
  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = formatJsxValue(children[i]);

    if (checkPassPrimitive(childOrAtom)) {
      continue;
    }

    if (checkAllowedPrivitive(childOrAtom)) {
      const text = childOrAtom.toString();

      strings.push(text);

      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const {text} = jsxNode.stingify({
      globalCtx,
      pathSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      stringifyContext,
    });

    insertedJsxCount++;
    strings.push(text);
  }

  return {
    text: strings.join(''),
  };
}
