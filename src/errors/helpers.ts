import {getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {ListenerManager} from '../utils/listeners.ts';
import {
  createErrorRegan,
  defaultErrorHandler,
  ErrorHandler,
  ErrorProps,
  ErrorRegan,
  getErrorContext,
} from './errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';
import {logError} from './logger.tsx';
import {GlobalCtx, GlobalCtxBoth} from '../global-ctx/global-ctx.ts';

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
    {component: Fragment}
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
        segmentEnt.contextEnt
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

export const runMount = async (mount: Mount, hNode: HNode) => {
  try {
    await mount(hNode);
  } catch (error) {
    const errorHandler = getContextValue(
      getErrorContext(),
      hNode.segmentEnt.contextEnt
    );
    const errorRegan = createErrorRegan({
      error,
      place: 'mount',
      segmentEnt: hNode.segmentEnt,
    });
    errorHandler({
      error: errorRegan,
    });

    hNode.segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
      handler({
        error: errorRegan,
        handled: !checkDefaultHandler(errorHandler),
      });
    });
  }
};

export const throwGlobalSystemError = (
  error: unknown,
  globalCtx: GlobalCtxBoth
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
