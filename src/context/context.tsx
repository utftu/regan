import {Ctx} from '../ctx/ctx.ts';
import {FC} from '../types.ts';

export type Context<TValue = any> = {
  name: string;
  defaultValue: TValue;
  Provider: FC<{value: TValue}>;
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
    <ContextProvider contextValue={value} context={context} />
  )) satisfies FC<{value: TValue}>;

  return context;
};

export const getContextValue = <TValue extends any = any>(
  context: Context<TValue>,
  {parent, systemProps}: Ctx
): TValue | void => {
  if (systemProps.context === context) {
    return systemProps.contextValue;
  }

  if (!parent) {
    return systemProps.context?.defaultValue;
  }

  return getContextValue(context, parent);
};

export const ContextProvider = <TValue extends any = any>(
  {
    contextValue,
    context,
  }: {
    contextValue: TValue;
    context: Context<TValue>;
  },
  {systemProps, children}: Ctx
) => {
  systemProps.context = context;
  systemProps.contextValue = contextValue;
  return children;
};
