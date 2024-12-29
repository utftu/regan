import {DomPointer} from '../types.ts';
import {convertElementNewToOld} from './convert.ts';
import {patchElement} from './handle.ts';
import {checkSkip, setSkip} from './skip.ts';
import {VNew, VNewElement, VOldElement} from './types.ts';
import {virtualApplyInternal} from './v.ts';

export type KeyStoreNew = Record<string, VNewElement>;
export type KeyStoreOld = Record<string, VOldElement>;

export const handleKey = ({
  vNew,
  keyStoreOld,
  keyStoreNew,
  window,
  domPointer,
}: {
  vNew: VNew;
  keyStoreOld: KeyStoreOld;
  keyStoreNew: KeyStoreNew;
  window: Window;
  domPointer: DomPointer;
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

  setSkip(vNew);
  setSkip(vOld);

  patchElement(vNew, vOld);

  virtualApplyInternal({
    vNews: vNew.children,
    vOlds: vOld.children,
    window,
    domPointer,
    // parent: vOld.element,
    keyStoreNew: vNew.keyStore,
    keyStoreOld: vOld.keyStore,
  });

  convertElementNewToOld(vNew, vOld.element);
};
