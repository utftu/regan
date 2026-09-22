import {ContextEnt, getContextValue} from '../context/context.tsx';
import {GlobalCtxBoth} from '../ctx/global.ts';
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
import {reportUncaught} from './report.ts';

// Что делают с ошибкой: кому отдают, что показывают взамен.

// Некому отдавать: до обработчика по умолчанию доходит тот, у кого выше нет
// ни одного ErrorGuard.
const checkDefaultHandler = (handler: AnyFunc) => {
  if (handler === defaultErrorHandler) {
    return true;
  }

  return false;
};

// Глобальные обработчики видят каждую ошибку, в том числе перехваченную, —
// один вызов на ошибку, ровно в том месте, где решилась её судьба.
const notifyGlobal = (
  globalCtx: GlobalCtxBoth,
  error: ErrorRegan,
  handled: boolean,
) => {
  globalCtx.errorHandlers.forEach((handler) => {
    handler({error, handled});
  });
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

  const guarded = checkDefaultHandler(errorHandler) === false;

  try {
    errorHandler({error: errorRegan});
  } catch (handlerError) {
    // Обработчик бросил — так устроен ErrorLogger, он печатает и отходит.
    // Значит замены разметки не было, и перехваченной ошибку звать нельзя.
    notifyGlobal(segmentEnt.globalCtx, errorRegan, false);

    throw handlerError;
  }

  notifyGlobal(segmentEnt.globalCtx, errorRegan, guarded);

  // Показать ошибку или пробросить дальше — решает вызывающий: у обновления
  // динамической области ошибка летит в апдейтер, у слушателя лететь некуда.
  return {handled: guarded, error: errorRegan};
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
  let children;

  try {
    children = [errorHandler({error})];
  } catch (handlerError) {
    notifyGlobal(segmentEnt.globalCtx, error, false);

    throw handlerError;
  }

  notifyGlobal(segmentEnt.globalCtx, error, true);

  return createJsxNodeComponent({
    component: Fragment,
    props: {},
    children,
  });
};

// Слушатель асинхронный, и пробрасывать из него некуда: проброс станет
// необработанным отклонением промиса. Поэтому всё, что не перехвачено,
// показываем сами — в том числе когда бросил сам обработчик, как делает
// ErrorLogger.
const handleListenerError = (error: unknown, segmentEnt: SegmentEnt) => {
  try {
    const result = handleError({error, place: 'handler', segmentEnt});

    if (result.handled === false) {
      reportUncaught(result.error);
    }
  } catch (handlerError) {
    reportUncaught(handlerError);
  }
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
      handleListenerError(error, segmentEnt);
    }
  };
};

// Ошибка, случившаяся вне дерева: перехватывать её некому,
// глобальным обработчикам сообщаем и бросаем дальше.
// Объявлена function, а не стрелкой: только так TypeScript понимает, что
// вызов ничего не возвращает, и не добавляет undefined в тип hydrate/stringify.
export function throwGlobalSystemError(
  error: unknown,
  globalCtx: GlobalCtxBoth,
): never {
  const errorRegan = createErrorRegan({
    error,
    place: 'system',
    segmentEnt: undefined,
  });

  notifyGlobal(globalCtx, errorRegan, false);

  throw errorRegan;
}
