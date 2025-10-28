import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {createContext} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc, SingleChild} from '../types.ts';
import {checkClassChild} from '../utils/check-parent.ts';

type ErrorPlace = 'jsx' | 'component' | 'handler' | 'mount' | 'system';

export class ErrorRegan extends Error {
  place: ErrorPlace;
  segmentEnt?: SegmentEnt;
  originalError: unknown;

  constructor({
    error,
    place = 'system',
    segmentEnt,
  }: {
    error: unknown;
    place?: ErrorPlace;
    segmentEnt?: SegmentEnt;
  }) {
    if (typeof error === 'string') {
      super(error);
    } else if (error instanceof Error) {
      super(error.message, {cause: error.cause});
      this.stack = error.stack;
      this.name = error.name;
    } else {
      super('Unknow type of error');
    }

    this.place = place;
    this.originalError = error;

    Object.defineProperty(this, 'segmentEnt', {
      value: segmentEnt,
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
}

export const createErrorRegan = ({
  error,
  place,
  segmentEnt,
}: {
  error: unknown;
  place?: ErrorPlace;
  segmentEnt: SegmentEnt | undefined;
}): ErrorRegan => {
  if (checkClassChild(error, 'errorRegan')) {
    return error;
  }

  return new ErrorRegan({error, place, segmentEnt});
};

export type ErrorProps = {
  error: ErrorRegan;
};

export type ErrorHandler = (props: ErrorProps) => SingleChild;
export const defaultErrorHandler = () => undefined;

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
  return createContext<ErrorHandler>('error_handler', defaultErrorHandler);
});
