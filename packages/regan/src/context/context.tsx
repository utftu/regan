import {Ctx} from '../ctx/ctx.ts';
import {FC} from '../types.ts';

export type Context<TValue = any> = {
  name: string;
  defaultValue: TValue;
  Provider: FC<{value: TValue}>;
};

export type ContextEnt<TValue = any> = {
  context: Context<TValue>;
  value: TValue;
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
    <ContextProvider value={value} context={context}>
      {children}
    </ContextProvider>
  )) satisfies FC<{value: TValue}>;

  return context;
};

export const getContextValue = <TValue extends any = any>(
  context: Context<TValue>,
  contextEnt?: ContextEnt
): TValue => {
  if (!contextEnt) {
    return context.defaultValue;
  }

  if (contextEnt.context === context) {
    return contextEnt.value;
  }

  if (!contextEnt.parent) {
    return context.defaultValue;
  }

  return getContextValue(context, contextEnt.parent);
};

export const ContextProvider = <TValue extends any = any>(
  _props: {value: TValue; context: Context},
  {children}: Ctx
) => {
  // systemProps.context = context;

  return children;
};

export const defaultContextEnt: ContextEnt = {
  context: createContext('default', null),
  value: null,
};
