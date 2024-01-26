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

export const createContext = <TValue extends any = any>(
  name: string,
  defaultValue: TValue
) => {
  const context = {
    name,
    defaultValue,
  } as Context<TValue>;
  context.Provider = (({value}) => (
    <ContextProvider context={{context, value}} />
  )) satisfies FC<{value: TValue}>;

  return context;
};

export const getContextValue = <TValue extends any = any>(
  context: Context<TValue>,
  {parent, systemProps}: Ctx
): TValue | void => {
  if (systemProps.context?.context === context) {
    return systemProps.context.value;
  }

  if (!parent) {
    return systemProps.context?.context.defaultValue;
  }

  return getContextValue(context, parent);
};

export const ContextProvider = <TValue extends any = any>(
  {context}: {context: ContextValue<TValue>},
  {systemProps, children}: Ctx
) => {
  systemProps.context = context;

  return children;
};
