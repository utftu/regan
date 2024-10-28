import {Ctx} from '../ctx/ctx.ts';
import {FC} from '../types.ts';

export type Context<TValue = any> = {
  name: string;
  defaultValue: TValue;
  Provider: FC<{value: TValue}>;
};

export type ContextValue<TValue = any> = {
  context: Context<TValue>;
  value: TValue;
};

export type ContextEnt = {
  context: ContextValue;
  parent?: ContextEnt;
};

export const createContext = <TValue extends any = any>(
  name: string,
  defaultValue: TValue
) => {
  const context = {
    name,
    defaultValue,
  } as Context<TValue>;
  context.Provider = (({value}, {children}) => (
    <ContextProvider context={{context, value}}>{children}</ContextProvider>
  )) satisfies FC<{value: TValue}>;

  return context;
};

export const getContextValue = <TValue extends any = any>(
  context: Context<TValue>,
  contextEnt: ContextEnt
): TValue => {
  if (!contextEnt) {
    return context.defaultValue;
  }

  if (contextEnt.context?.context === context) {
    return contextEnt.context.value;
  }

  if (!contextEnt.parent) {
    return context.defaultValue;
  }

  return getContextValue(context, contextEnt.parent);
};

export const ContextProvider = <TValue extends any = any>(
  {context}: {context: ContextValue<TValue>},
  {systemProps, children}: Ctx
) => {
  systemProps.context = context;

  return children;
};

export const defaultContextEnt: ContextEnt = {
  context: {
    context: createContext('default', null),
    value: null,
  },
};
