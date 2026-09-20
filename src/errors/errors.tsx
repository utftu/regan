import {Context, createContext} from '../context/context.tsx';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';

export type ErrorPlace =
  | 'jsx'
  | 'component'
  | 'handler'
  | 'mount'
  | 'system';

export class ErrorRegan extends Error {
  // маркер вместо instanceof: если в дереве зависимостей окажутся две копии
  // regan, классы у них будут разные, а поле переживёт это
  readonly reganError = true;

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
      super('Unknown type of error');
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

export const checkErrorRegan = (error: unknown): error is ErrorRegan => {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ErrorRegan).reganError === true
  );
};

export const createErrorRegan = ({
  error,
  place,
  segmentEnt,
}: {
  error: unknown;
  place?: ErrorPlace;
  segmentEnt: SegmentEnt | undefined;
}): ErrorRegan => {
  if (checkErrorRegan(error)) {
    return error;
  }

  return new ErrorRegan({error, place, segmentEnt});
};

export type ErrorProps = {
  error: ErrorRegan;
};

export type ErrorHandler = (props: ErrorProps) => SingleChild;
export const defaultErrorHandler = () => undefined;

// Контекст создаётся при первом обращении: на момент загрузки модуля
// createContext ещё недоступен из-за кольца импортов.
let errorContext: Context<ErrorHandler> | undefined;

export const getErrorContext = () => {
  errorContext ??= createContext<ErrorHandler>(
    'error_handler',
    defaultErrorHandler
  );

  return errorContext;
};
