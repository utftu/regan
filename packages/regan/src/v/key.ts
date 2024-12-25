import {patchElement} from './handle.ts';
import {VNew, VNewElement, VOldElement} from './types.ts';
import {
  checkSkip,
  convertElementNewToOld,
  setSkip,
  virtualApplyInternal,
} from './v.ts';

export type KeyStoreNew = Record<string, VNewElement>;
export type KeyStoreOld = Record<string, VOldElement>;

export const handleKey = ({
  vNew,
  keyStoreOld,
  keyStoreNew,
  window,
}: {
  vNew: VNew;
  keyStoreOld: KeyStoreOld;
  keyStoreNew: KeyStoreNew;
  window: Window;
}) => {
  if (vNew.type !== 'element' || !('key' in vNew)) {
    return;
  }
  // console.log('-----', 'here2', vNew);
  const key = vNew.key!;

  keyStoreNew[key] = vNew;

  if (!(key in keyStoreOld)) {
    return;
  }

  const vOld = keyStoreOld[key];

  if (checkSkip(vOld)) {
    return;
  }

  // console.log('-----', 'here3');

  setSkip(vNew);
  setSkip(vOld);

  patchElement(vNew, vOld);

  virtualApplyInternal({
    vNews: vNew.children,
    vOlds: vOld.children,
    window,
    parent: vOld.element,
    keyStoreNew: vNew.keyStore,
    keyStoreOld: vOld.keyStore,
  });

  convertElementNewToOld(vNew, vOld.element);
  // console.log('-----', 'here4');

  // console.log('-----', 'vNew', vNew);
};
