import {createContext} from '../context/context.tsx';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {h} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc, FC} from '../types.ts';

type Props = {
  error: Error | unknown;
  jsxNode: JsxNode;
};

type HadnlerProps = Props & {segmentEnt: SegmentEnt};
type ErrorHandler = (props: HadnlerProps) => void;
type ErrorJsx = FC<Props>;
type ErrorCommonHandler = (props: Props) => void;

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

export const makeLazy = <TFunc extends AnyFunc>(
  func: TFunc
): (() => ReturnType<TFunc>) => {
  let value: ReturnType<typeof func>;
  return () => {
    if (!value) {
      value = func();
    }

    return value;
  };
};

export const getErrorHandlerContext = makeLazy(() => {
  return createContext<ErrorHandler>('error_handler', defaultErrorHandler);
});

export const getErrorJsxContext = makeLazy(() => {
  return createContext<ErrorJsx>('error_jsx', defaultErrorJsx);
});

export const getErrorCommonContext = makeLazy(() => {
  return createContext<ErrorCommonHandler>('error_common', () => {});
});

export const ErrorGuardHandler: FC<{errorHandler: ErrorHandler}> = (
  {errorHandler},
  {children}
) => {
  return h(getErrorHandlerContext().Provider, {value: errorHandler}, children);
};

export const ErrorGuardJsx: FC<{errorJsx: ErrorJsx}> = (
  {errorJsx},
  {children}
) => {
  return h(getErrorJsxContext().Provider, {value: errorJsx}, children);
};
