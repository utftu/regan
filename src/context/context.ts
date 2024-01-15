import {Ctx} from '../ctx/ctx.ts';
import {FC} from '../types.ts';

type Context<TValue = any> = {};

export const createContext = () => {
  return {} satisfies Context;
};

export const getContextValue = <TValue = any>(
  context: Context<TValue>,
  {contexts, parent}: Ctx
): TValue | void => {
  if (contexts?.has(context)) {
    return contexts.get(context);
  }

  if (!parent) {
    return;
  }

  return getContextValue(context, parent);
};

// FC<{value: any, context: Context}>
export const ContextProvider = (<TValue = any>(
  _props: {
    value: TValue;
    context: Context<TValue>;
  },
  ctx: Ctx
) => {
  return ctx.children;
}) satisfies FC;

// const ContextProvider: FC<{value: any}> = <T>(context: Context, value: any) => {};
