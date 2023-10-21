import {Atom, select, selectBase, SelectCb} from 'strangelove';
import {getRoot} from './root/root.ts';

export function runOnPromise<TValue>(
  maybePromise: Promise<TValue> | TValue,
  cb: (value: TValue) => void
) {
  if (maybePromise instanceof Promise) {
    maybePromise.then(cb);
  } else {
    cb(maybePromise);
  }
}

function runOnAtomAndSubscribe<TValue = any>(
  possibleValue: TValue | Atom<TValue>,
  cb: (value: TValue) => void
) {
  if (possibleValue instanceof Atom) {
    select((get) => {
      const value = get(possibleValue) as TValue;
      cb(value);
    });
  } else {
    cb(possibleValue);
  }
}

export function selectRegan<TCb extends SelectCb>(cb: TCb) {
  return selectBase<TCb>(cb, {
    root: getRoot(),
    onAtomCreate: () => {},
  });
}
