import {InsertPoint} from '../types.ts';
import {getDomNode, handle} from './handle.ts';
import {VNew, VOld, VOldElement} from './types.ts';

export const virtualApply = ({
  vNews,
  vOlds,
  insertPoint,
  window,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  insertPoint: InsertPoint;
  window: Window;
}) => {
  virtualApplyInternal({
    vNews,
    vOlds,
    insertPoint,
    window,
  });

  return vNews as VOld[];
};

export const virtualApplyInternal = ({
  vNews,
  vOlds,
  insertPoint,
  window,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  insertPoint: InsertPoint;
  window: Window;
}) => {
  let prevNode = insertPoint.prevNode;
  const maxLayer = Math.max(vNews.length, vOlds.length);

  for (let i = 0; i < maxLayer; i++) {
    const vNew = vNews[i];
    const vOld = vOlds[i];

    handle({
      vNew,
      vOld,
      window,
      insertPoint: {parent: insertPoint.parent, prevNode},
    });

    if (vNew) {
      prevNode = getDomNode(vNew as VOld);
    }

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      const vNewAsVOld = vNew as VOld;

      const vOldChildren = vOld?.type === 'element' ? vOld.children : [];
      const vNewChildren = vNew?.type === 'element' ? vNew.children : [];

      if (vNewChildren.length === 0 && vOldChildren.length === 0) {
        continue;
      }

      const localInsertPoint: InsertPoint =
        vNew?.type === 'element'
          ? {parent: (vNewAsVOld as VOldElement).element}
          : {parent: insertPoint.parent, prevNode};

      virtualApplyInternal({
        vNews: vNewChildren,
        vOlds: vOldChildren,
        insertPoint: localInsertPoint,
        window,
      });
    }
  }
};
