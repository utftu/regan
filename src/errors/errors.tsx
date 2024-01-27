import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {FC} from '../types.ts';

const defaultErrorHandler = () => null;

const defaultErrorConfig = {
  error: defaultErrorHandler,
  errorJsx: defaultErrorHandler,
};
export const errorContext = createContext<{
  error: (...args: any[]) => any;
  errorJsx: FC;
}>('system error', defaultErrorConfig);

export const ErrorGuard: FC<{error?: any; errorJsx?: FC}> = (
  {error, errorJsx},
  {children}
) => {
  return h(
    errorContext.Provider,
    {
      value: {
        error: error ?? defaultErrorHandler,
        errorJsx: errorJsx ?? defaultErrorHandler,
      },
    },
    children
  );
};
