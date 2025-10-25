import {handleCommonError} from '../errors/helpers.ts';
import {AreaCtx, GlobalCtx, GlobalCtxServer} from '../global-ctx/global-ctx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {
  checkAllowedPrivitive,
  checkAllowedStructure,
  checkPassPrimitive,
  formatJsxValue,
  wrapChildIfNeed,
} from '../utils/jsx.ts';

export type HandleChildrenStringifyResult = {
  text: string;
};

export function handleChildrenString({
  children,
  globalCtx,
  parentSegmentEnt,
  areaCtx,
}: {
  children: SingleChild[];
  globalCtx: GlobalCtxServer;
  parentSegmentEnt: SegmentEnt;
  areaCtx: AreaCtx;
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

    if (checkAllowedStructure(childOrAtom) === false) {
      handleCommonError('Invalid structura', parentSegmentEnt);
      continue;
    }

    const jsxNode = wrapChildIfNeed(childOrAtom);

    const {text} = jsxNode.stingify({
      globalCtx,
      pathSegmentName: insertedJsxCount.toString(),
      parentSegmentEnt,
      areaCtx,
    });

    insertedJsxCount++;
    strings.push(text);
  }

  return {
    text: strings.join(''),
  };
}
