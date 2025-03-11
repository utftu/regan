import {VNew, VOld} from './types.ts';

export const setSkip = (vNew: VNew | VOld) => {
  vNew.skip = true;
};
export const deleteSkip = (v: VNew | VOld | void) => {
  if (!v) {
    return;
  }
  delete v.skip;
};
export const checkSkip = (vNew: VNew | void) => {
  if (!vNew) {
    return false;
  }
  if ('skip' in vNew) {
    return true;
  }
  return false;
};
