import type {Ctx} from '../ctx/ctx.ts';
import type {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import type {FC} from '../types.ts';
import {checkClassChild} from '../utils/check-parent.ts';

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

export function createContext<TValue extends any = any>(
  name: string,
  defaultValue: TValue
) {
  const context = {
    name,
    defaultValue,
  } as Context<TValue>;
  context.Provider = (({value}, {children}) => {
    return (
      <ContextProvider value={value} context={context}>
        {children}
      </ContextProvider>
    );
  }) satisfies FC<{value: TValue}>;

  return context;
}

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

export const ContextProvider: FC = <TValue extends any = any>(
  _props: {value: TValue; context: Context},
  {children}: Ctx
) => {
  return children;
};

export const selectContextEnt = (
  jsxNode: JsxNode,
  parentContextEnt?: ContextEnt
): ContextEnt | undefined => {
  if (
    checkClassChild(jsxNode, 'jsxNodeComponent') &&
    jsxNode.component === ContextProvider
  ) {
    return {
      value: jsxNode.props.value,
      context: jsxNode.props.context,
      parent: parentContextEnt,
    };
  }

  return parentContextEnt;
};
