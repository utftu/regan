import {getContextValue} from '../context/context.tsx';
import {Ctx} from '../ctx/ctx.ts';
import {errorContext} from '../errors/errors.tsx';
import {JsxNode} from '../node/node.ts';

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

export const prepareEventListener = ({
  listener,
  ctx,
  jsxNode,
}: {
  listener: (...args: any[]) => any;
  ctx?: Ctx;
  jsxNode: JsxNode;
}) => {
  return (...args: any[]) => {
    try {
      listener(...args);
    } catch (error) {
      const errorConfig = getContextValue(errorContext, ctx);
      errorConfig.error({error: error as Error, jsxNode});
    }
  };
};
