import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FCStaticParams} from '../types.ts';

export const getInsertedCount = async (
  child: JsxNode,
  execResult: Promise<{insertedDomCount: number}>
) => {
  if (child instanceof JsxNodeElement) {
    return 1;
  } else if (child instanceof JsxNodeComponent) {
    if (
      child.systemProps.needAwait === true ||
      (child.type as FCStaticParams)[NEED_AWAIT] === true
    ) {
      const {insertedDomCount} = await execResult;
      return insertedDomCount;
    } else if ('insertedTagsCount' in child.systemProps) {
      return child.systemProps.insertedTagsCount as number;
    } else if (INSERTED_TAGS_COUNT in child.type) {
      return child.type[INSERTED_TAGS_COUNT] as number;
    } else {
      return 1;
    }
  }
  return 1;
};
