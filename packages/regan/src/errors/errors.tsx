import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {createContext} from '../context/context.tsx';
// import {JsxNode} from '../jsx-node/jsx-node.ts';
// import {JsxNodeElement} from '../jsx-node/variants/element/element.ts';
import {h} from '../jsx/jsx.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc, SingleChild} from '../types.ts';

type Props = {
  error: Error | unknown;
  // jsxNode: JsxNode;
  segmentEnt: SegmentEnt;
};

// type HadnlerProps = Props & {segmentEnt: SegmentEnt};
// type ErrorHandlerOld = (props: HadnlerProps) => void;
// type ErrorJsx = FC<Props>;
// type ErrorCommonHandler = (props: Props) => void;

export type ErrorHandler = (props: Props) => SingleChild;
const defaultHandler = () => undefined;

// export const defaultErrorHandler = () => {};
// export const defaultErrorJsx = () => {
//   return new JsxNodeElement(
//     {
//       props: {},
//       systemProps: {},
//       children: [],
//     },
//     {tagName: 'fragment'}
//   );
// };

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

export const getDefaultErrorComponent = makeLazy(() => {
  return new JsxNodeComponent(
    {
      props: {},
      systemProps: {},
      children: [],
    },
    {component: () => null}
  );
});

// export const defaultErrorComponentJsx = new JsxNodeComponent(
//   {
//     props: {},
//     systemProps: {},
//     children: [],
//   },
//   {component: () => null}
// );

export const getErrorContext = makeLazy(() => {
  return createContext<ErrorHandler>('error_handler', defaultHandler);
});

// export const getErrorContextOld = makeLazy(() => {
//   return createContext<ErrorHandlerOld>('error_handler', defaultErrorHandler);
// });

// export const getErrorHandlerContext = makeLazy(() => {
//   return createContext<ErrorHandlerOld>('error_handler', defaultErrorHandler);
// });

// export const getErrorJsxContext = makeLazy(() => {
//   return createContext<ErrorJsx>('error_jsx', defaultErrorJsx);
// });

// export const getErrorCommonContext = makeLazy(() => {
//   return createContext<ErrorCommonHandler>('error_common', () => {});
// });

// export const ErrorGuardHandler: FC<{errorHandler: ErrorHandlerOld}> = (
//   {errorHandler},
//   {children}
// ) => {
//   return h(getErrorHandlerContext().Provider, {value: errorHandler}, children);
// };

// export const ErrorGuardJsx: FC<{errorJsx: ErrorJsx}> = (
//   {errorJsx},
//   {children}
// ) => {
//   return h(getErrorJsxContext().Provider, {value: errorJsx}, children);
// };

// export const ErrorCommanGuard: FC<{errorCommon: ErrorCommonHandler}> = (
//   {errorCommon},
//   {children}
// ) => {
//   return h(getErrorCommonContext().Provider, {value: errorCommon}, children);
// };
