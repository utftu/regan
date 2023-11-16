import {Ctx} from './ctx/ctx.ts';
import {HNode} from './h-node/h-node.ts';
import {destroyAtom} from './node/node.ts';

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

// export function getParentDom(node: HNode) {
//   if (node.elem) {
//     return node.elem;
//   }

//   if (node.parent) {
//     return getParentDom(node);
//   }

//   return null;
// }

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

export const createSmartMount = (ctx: Ctx) => (hNode: HNode) => {
  const unmounts = ctx.state.mounts.map((mount) => mount());

  hNode.unmounts.push(() => {
    unmounts.forEach((possibleUnmount) => {
      if (typeof possibleUnmount === 'function') {
        possibleUnmount();
      }
    });
    ctx.state.atoms.forEach((possibleAtom) => {
      if (possibleAtom instanceof Promise) {
        possibleAtom.then((atom) => destroyAtom(atom));
      } else {
        destroyAtom(possibleAtom);
      }
    });
  });
};
