import {Atom, select, selectBase, SelectCb} from 'strangelove';
import {getRoot} from './atoms/atoms.ts';
import {HNode} from './node/hydrate/hydrate.ts';

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

export function joinPath(oldPart: string, newPart: string) {
  if (oldPart === '') {
    return newPart;
  }
  return `${oldPart}.${newPart}`;
}

export function getParentDom(node: HNode) {
  if (node.elem) {
    return node.elem;
  }

  if (node.parent) {
    return getParentDom(node);
  }

  return null;
}
