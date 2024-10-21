import {getContextValue} from '../context/context.tsx';
import {Ctx} from '../ctx/ctx.ts';
import {errorContext} from './errors.tsx';
import {JsxNode} from '../node/node.ts';

export const prepareListenerForError = ({
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
