import {patchElement} from './handle.ts';
import {VNew, VNewElement, VOld, VOldElement} from './types.ts';
import {setSkip} from './v.ts';

// type StoreKey = {
//   keys: Map<string, Element>;
//   allParsed: boolean;
// };

type StoreKey = Record<string, VNewElement>;
type StoreKeyOld = Record<string, VOldElement>;

const handleKey = ({
  vNew,
  // vOld,
  // vNews,
  // vOlds,
  oldStore,
  newStore,
}: {
  vNew: VNew;
  oldStore: StoreKeyOld;
  newStore: StoreKey;
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
