import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {createContext} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc, SingleChild} from '../types.ts';

type ErrorPlace = 'jsx' | 'handler' | 'mount';

export type ErrorProps = {
  error: Error | unknown;
  segmentEnt: SegmentEnt;
  place: ErrorPlace;
};

export type ErrorHandler = (props: ErrorProps) => SingleChild;
const defaultHandler = () => undefined;

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

export const getErrorContext = makeLazy(() => {
  return createContext<ErrorHandler>('error_handler', defaultHandler);
});
