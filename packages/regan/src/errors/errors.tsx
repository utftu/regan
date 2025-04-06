import {createContext} from '../context/context.tsx';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {h} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {FC} from '../types.ts';

type Props = {
  error: Error | unknown;
  jsxNode: JsxNode;
};

type HadnlerProps = Props & {segmentEnt: SegmentEnt};
type ErrorHandler = (props: HadnlerProps) => void;
type ErrorJsx = FC<Props>;

export const defaultErrorHandler = () => {};
export const defaultErrorJsx = () => {
  return new JsxNodeElement(
    {
      props: {},
      systemProps: {},
      children: [],
    },
    {tagName: 'fragment'}
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
