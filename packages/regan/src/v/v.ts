import {DomPointer} from '../types.ts';
import {handle} from './handle.ts';
import {VNew, VOld, VOldElement} from './types.ts';

export const virtualApplyExternal = ({
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
  const maxLayer = Math.max(vNews.length, vOlds.length);
  for (let i = 0; i < maxLayer; i++) {
    const vNew = vNews[i];
    const vOld = vOlds[i];
    handle({vNew, vOld, window, domPointer});

    if (vNew.type === 'element' || vOld.type === 'element') {
      const vNewAsVOld = vNew as VOld;

      const vOldChildren = vOld.type === 'element' ? vOld.children : [];
      const vNewChildren = vNew.type === 'element' ? vNew.children : [];
      const localDomPointer =
        vNew.type === 'element'
          ? {parent: (vNewAsVOld as VOldElement).element, elementsCount: 0}
          : domPointer;

      virtualApplyExternal({
        vNews: vNewChildren,
        vOlds: vOldChildren,
        domPointer: localDomPointer,
        window,
      });
    }
  }
};
