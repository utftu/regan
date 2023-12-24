import {destroyAtom} from './atoms/atoms.ts';
import {Ctx} from './ctx/ctx.ts';
import {HNode} from './h-node/h-node.ts';
import {hydrate} from './hydrate/hydrate.ts';
import {JSXNode} from './node/node.ts';
import {getString} from './string/string.ts';
import {JSDOM} from 'jsdom';

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

export async function insertAndHydrate({
  jsdom,
  jsxNode,
}: {
  jsdom: JSDOM;
  jsxNode: JSXNode;
}) {
  const root = jsdom.window.document.createElement('div');
  root.setAttribute('id', 'root');
  jsdom.window.document.body.appendChild(root);

  const str = await getString(jsxNode);
  root.innerHTML = str;

  await hydrate(root, jsxNode, {
    window: jsdom.window as any,
  });

  return root;
}
