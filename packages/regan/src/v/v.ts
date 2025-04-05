import {DomPointer} from '../types.ts';
import {handle} from './handle.ts';
import {VNew, VOld, VOldElement} from './types.ts';

export const virtualApply = ({
  vNews,
  vOlds,
  domPointer,
  window,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  domPointer: DomPointer;
  window: Window;
}) => {
  virtualApplyInternal({
    vNews,
    vOlds,
    domPointer,
    window,
  });

  return vNews as VOld[];
};

export const virtualApplyInternal = ({
  vNews,
  vOlds,
  domPointer,
  window,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  domPointer: DomPointer;
  window: Window;
}) => {
  let nodeCount = domPointer.nodeCount;

  // let elementsCount = domPointer.nodeCount;
  const maxLayer = Math.max(vNews.length, vOlds.length);
  for (let i = 0; i < maxLayer; i++) {
    const vNew = vNews[i];
    const vOld = vOlds[i];
    handle({
      vNew,
      vOld,
      window,
      domPointer: {parent: domPointer.parent, nodeCount},
    });

    // if (vNew?.type === 'element') {
    if (vNew) {
      nodeCount++;
    }

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      const vNewAsVOld = vNew as VOld;

      const vOldChildren = vOld?.type === 'element' ? vOld.children : [];
      const vNewChildren = vNew?.type === 'element' ? vNew.children : [];

      if (vNewChildren.length === 0 && vOldChildren.length === 0) {
        continue;
      }
      const localDomPointer: DomPointer =
        vNew?.type === 'element'
          ? {parent: (vNewAsVOld as VOldElement).element, nodeCount: 0}
          : {parent: domPointer.parent, nodeCount};

      virtualApplyInternal({
        vNews: vNewChildren,
        vOlds: vOldChildren,
        domPointer: localDomPointer,
        window,
      });
    }
  }
};
