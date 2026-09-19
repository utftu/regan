import {ContextEnt, getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {
  createErrorRegan,
  defaultErrorHandler,
  ErrorHandler,
  ErrorPlace,
  ErrorProps,
  ErrorRegan,
  getErrorContext,
} from './errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';
import {logError} from './logger.tsx';
import {GlobalCtxBoth} from '../global-ctx/global-ctx.ts';

type GlobalHandlerProps = ErrorProps & {handled: boolean};
export type GlobalErrorHandler = (props: GlobalHandlerProps) => any;

const checkDefaultHandler = (handler: AnyFunc) => {
  if (handler === defaultErrorHandler || handler === logError) {
    return true;
  }
  return false;
};

export const createErrorComponent = ({
  error,
  errorHandler,
  segmentEnt,
}: {
  error: ErrorRegan;
  errorHandler: ErrorHandler;
  segmentEnt: SegmentEnt;
}) => {
  const errorJsx = errorHandler({error});

  const errorJsxComponent = new JsxNodeComponent(
    {props: {}, children: [errorJsx]},
    {component: Fragment},
  );

  segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
    handler({error, handled: !checkDefaultHandler(errorHandler)});
  });

  return errorJsxComponent;
};

export const prepareListener = ({
  listenerManager,
  func,
}: {
  func: AnyFunc;
  listenerManager: ListenerManager;
}) => {
  const segmentEnt = listenerManager.segmentEnt;
  return async (...args: any[]) => {
    try {
      await func(...args);
    } catch (error) {
      const errorRegan = createErrorRegan({
        error,
        place: 'handler',
        segmentEnt,
      });
      const errorHandler = getContextValue(
        getErrorContext(),
        segmentEnt.contextEnt,
      );
      errorHandler({
        error: errorRegan,
      });

      segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
        handler({
          error: errorRegan,
          handled: !checkDefaultHandler(errorHandler),
        });
      });
    }
  };
};

// Поднимается на skip штук ErrorGuard вверх: если запасной вариант тоже
// упал, ошибку должен увидеть следующий guard, а не тот же самый.
const getErrorContextEnt = (contextEnt: ContextEnt | undefined, skip: number) => {
  const context = getErrorContext();
  let current = contextEnt;

  while (skip > 0) {
    while (current && current.context !== context) {
      current = current.parent;
    }

    if (!current) {
      return;
    }

    current = current.parent;
    skip--;
  }

  return current;
};

// Отдаёт ошибку ближайшему ErrorGuard и глобальным обработчикам.
// Так работают и слушатели, и mount, и обновление динамической области.
export const handleError = ({
  error,
  place,
  segmentEnt,
  skip = 0,
}: {
  error: unknown;
  place: ErrorPlace;
  segmentEnt: SegmentEnt;
  skip?: number;
}) => {
  const errorRegan = createErrorRegan({error, place, segmentEnt});
  const errorHandler = getContextValue(
    getErrorContext(),
    getErrorContextEnt(segmentEnt.contextEnt, skip),
  );

  const handled = !checkDefaultHandler(errorHandler);

  errorHandler({error: errorRegan});

  segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
    handler({error: errorRegan, handled});
  });

  return {handled};
};

export const runMount = async (mount: Mount, hNode: HNode) => {
  try {
    await mount(hNode);
  } catch (error) {
    handleError({error, place: 'mount', segmentEnt: hNode.segmentEnt});
  }
};

export const throwGlobalSystemError = (
  error: unknown,
  globalCtx: GlobalCtxBoth,
) => {
  const errorRegan = createErrorRegan({
    error,
    place: 'system',
    segmentEnt: undefined,
  });

  globalCtx.errorHandlers.forEach((handler) => {
    handler({error: errorRegan, handled: false});
  });

  throw errorRegan;
};
