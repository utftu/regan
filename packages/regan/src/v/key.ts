import {patchElement} from './handle.ts';
import {VNew, VNewElement, VOldElement} from './types.ts';
import {setSkip} from './v.ts';

export type StoreKeyNew = Record<string, VNewElement>;
export type StoreKeyOld = Record<string, VOldElement>;

const handleKey = ({
  vNew,
  oldStore,
  newStore,
}: {
  vNew: VNew;
  oldStore: StoreKeyOld;
  newStore: StoreKeyNew;
}) => {
  if (vNew.type !== 'element' || !('key' in vNew)) {
    return;
  }
  const key = vNew.key!;

  newStore[key] = vNew;

  if (!(key in oldStore)) {
    return;
  }

  const vOld = oldStore[key];

  patchElement(vNew, vOld);

  setSkip(vNew);
  setSkip(vOld);
};
