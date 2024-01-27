import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {FC} from '../types.ts';

const defaultErrorHandler = () => null;
export const errorContext = createContext<(...values: any[]) => any>(
  'system error',
  defaultErrorHandler
);

export const ErrorGuard: FC<{error: (error: Error) => ReturnType<FC>}> = (
  {error},
  {children}
) => {
  return h(
    errorContext.Provider,
    {
      value: error,
    },
    children
  );
};
