import {getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {
  createErrorRegan,
  defaultErrorHandler,
  ErrorHandler,
  ErrorProps,
  ErrorRegan,
  getErrorContext,
} from './errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

type GlobalHandlerProps = ErrorProps & {handled: boolean};
export type GlobalHandler = (props: GlobalHandlerProps) => any;

export const createErrorComponent = ({
  error,
  errorHandler,
}: {
  error: ErrorRegan;
  errorHandler: ErrorHandler;
}) => {
  const errorJsx = errorHandler({error});

  const errorJsxComponent = new JsxNodeComponent(
    {props: {}, children: [errorJsx]},
    {component: Fragment}
  );

  error.segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
    handler({error, handled: errorHandler !== defaultErrorHandler});
  });

  return errorJsxComponent;
};

export const prepareListener = ({
  listenerManager,
  func,
}: {
  func: AnyFunc;
  listenerManager: LisneterManager;
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
          error,
          handled: errorHandler !== defaultErrorHandler,
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
        error,
        handled: errorHandler !== defaultErrorHandler,
      });
    });
  }
};

export const handleJsxError = (message: string, segmentEnt: SegmentEnt) => {
  const commonHandler = getContextValue(
    getErrorContext(),
    segmentEnt.contextEnt
  );
  const errorRegan = createErrorRegan({
    error: message,
    place: 'jsx',
    segmentEnt,
  });
  commonHandler({
    error: errorRegan,
  });
};
