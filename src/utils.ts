import {selectBase, SelectCb} from 'strangelove';
import {getRoot} from './atoms/atoms.ts';
import {HNode} from './h-node/h-node.ts';
import {JsxPathSegment, JSXSegment} from './node/node.ts';

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

// export function selectRegan<TCb extends SelectCb>(cb: TCb) {
//   return selectBase<TCb>(cb, {
//     root: getRoot(),
//     onAtomCreate: () => {},
//   });
// }

export function getParentDom(node: HNode) {
  if (node.elem) {
    return node.elem;
  }

  if (node.parent) {
    return getParentDom(node);
  }

  return null;
}

export function addEventListenerStore({
  listener,
  name,
  elem,
  store,
}: {
  listener: EventListener;
  name: string;
  elem: HTMLElement;
  store: Record<any, any>;
}) {
  if (name in store) {
    elem.removeEventListener(name, store[name]);
  }

  elem.addEventListener(name, listener);
  store[name] = listener;
  return;
}
