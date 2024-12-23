import {patchElement} from './handle.ts';
import {VNew, VNewElement, VOldElement} from './types.ts';
import {setSkip} from './v.ts';

export type KeyStoreNew = Record<string, VNewElement>;
export type KeyStoreOld = Record<string, VOldElement>;

const handleKey = ({
  vNew,
  keyStoreOld,
  keyStoreNew,
}: {
  vNew: VNew;
  keyStoreOld: KeyStoreOld;
  keyStoreNew: KeyStoreNew;
}) => {
  if (vNew.type !== 'element' || !('key' in vNew)) {
    return;
  }
  const key = vNew.key!;

  keyStoreNew[key] = vNew;

  if (!(key in keyStoreOld)) {
    return;
  }

  const vOld = keyStoreOld[key];

  patchElement(vNew, vOld);

  setSkip(vNew);
  setSkip(vOld);
};
