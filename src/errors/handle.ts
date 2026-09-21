import {ContextEnt, getContextValue} from '../context/context.tsx';
import {GlobalCtxBoth} from '../ctx/global.ts';
import {HNode, Mount} from '../h-node/h-node.ts';
import {createJsxNodeComponent} from '../jsx-node/jsx-node.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {
  createErrorRegan,
  defaultErrorHandler,
  ErrorHandler,
  ErrorPlace,
  ErrorRegan,
  getErrorContext,
} from './errors.ts';
import {logError} from './logger.tsx';

// Что делают с ошибкой: кому отдают, что показывают взамен.

// Обработчик по умолчанию ничего не показывает, логгер только печатает —
// оба означают «никто не перехватил».
const checkDefaultHandler = (handler: AnyFunc) => {
  if (handler === defaultErrorHandler || handler === logError) {
    return true;
  }

  return false;
};

// Поднимается на skip штук ErrorGuard вверх: если запасной вариант тоже
// упал, ошибку должен увидеть следующий guard, а не тот же самый.
const getErrorContextEnt = (
  contextEnt: ContextEnt | undefined,
  skip: number,
) => {
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
// Через это проходят и слушатели, и mount, и обновление динамической области.
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

// Запасная разметка от ErrorGuard, завёрнутая во Fragment,
// чтобы стадия могла отрендерить её как обычного ребёнка.
export const createErrorComponent = ({
  error,
  errorHandler,
  segmentEnt,
}: {
  error: ErrorRegan;
  errorHandler: ErrorHandler;
  segmentEnt: SegmentEnt;
}) => {
  const errorJsxComponent = createJsxNodeComponent({
    component: Fragment,
    props: {},
    children: [errorHandler({error})],
  });

  segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
    handler({error, handled: !checkDefaultHandler(errorHandler)});
  });

  return errorJsxComponent;
};

// Обёртка вокруг пользовательского обработчика события.
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
      handleError({error, place: 'handler', segmentEnt});
    }
  };
};

export const runMount = async (mount: Mount, hNode: HNode) => {
  try {
    await mount(hNode);
  } catch (error) {
    handleError({error, place: 'mount', segmentEnt: hNode.segmentEnt});
  }
};

// Ошибка, случившаяся вне дерева: перехватывать её некому,
// глобальным обработчикам сообщаем и бросаем дальше.
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
