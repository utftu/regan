import {getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {ErrorHandler, getErrorContext} from './errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

type GlobalHandlerProps = {
  error: unknown;
  segmentEnt: SegmentEnt;
  handled: boolean;
};
export type GlobalHandler = (props: GlobalHandlerProps) => any;

export const createErrorComponent = ({
  error,
  segmentEnt,
  errorHandler,
}: {
  error: unknown;
  segmentEnt: SegmentEnt;
  errorHandler: ErrorHandler;
}) => {
  const errorJsx = errorHandler({error, segmentEnt});

  const errorJsxComponent = new JsxNodeComponent(
    {props: {}, children: [errorJsx]},
    {component: Fragment}
  );

  segmentEnt.globalCtx.errorHandlers.forEach((handler) => {
    handler({error, segmentEnt, handled: true});
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
  return async (...args: any[]) => {
    try {
      await func(...args);
    } catch (error) {
      const errorHandler = getContextValue(
        getErrorContext(),
        listenerManager.segmentEnt.contextEnt
      );
      errorHandler({
        error,
        segmentEnt: listenerManager.segmentEnt,
        place: 'handler',
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
    errorHandler({
      error,
      segmentEnt: hNode.segmentEnt,
      place: 'mount',
    });
  }
};

export const handleCommonError = (message: string, segmentEnt: SegmentEnt) => {
  const commonHandler = getContextValue(
    getErrorContext(),
    segmentEnt.contextEnt
  );
  commonHandler({
    segmentEnt,
    error: new Error(message),
    place: 'jsx',
  });
};
