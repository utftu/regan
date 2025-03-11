import {
  ContextEnt,
  createContext,
  getContextValue,
} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {h} from '../jsx/jsx.ts';
import {AnyFunc, FC} from '../types.ts';
import {LisneterManager} from '../utils/listeners.ts';

type Props = {
  error: Error | unknown;
  jsxNode: JsxNode;
};

type ErrorHandler = (props: Props) => void;
type ErrorJsx = FC<Props>;

export const defaultErrorHandler = () => {};
export const defaultErrorJsx = () => {
  return new JsxNodeElement(
    {
      props: {},
      systemProps: {},
      children: [],
    },
    {tagName: 'div'}
  );
};

export const errorContextHandler = createContext<ErrorHandler>(
  'error_handler',
  defaultErrorHandler
);
export const errorContextJsx = createContext<ErrorJsx>(
  'error_jsx',
  defaultErrorJsx
);

export const ErrorGuardHandler: FC<{errorHandler: ErrorHandler}> = (
  {errorHandler},
  {children}
) => {
  return h(errorContextHandler.Provider, {value: errorHandler}, children);
};

export const ErrorGuardJsx: FC<{errorJsx: ErrorJsx}> = (
  {errorJsx},
  {children}
) => {
  return h(errorContextJsx.Provider, {value: errorJsx}, children);
};
