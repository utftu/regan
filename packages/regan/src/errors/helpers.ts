import {ContextEnt, getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {ErrorHandler, getErrorContext} from './errors.tsx';
import {Fragment} from '../components/fragment/fragment.ts';

export const createErrorComponent = ({
  error,
  // parentContextEnt,
  segmentEnt,
  errorHandler,
}: {
  error: unknown;
  // parentContextEnt?: ContextEnt;
  segmentEnt: SegmentEnt;
  errorHandler: ErrorHandler;
}) => {
  const errorJsx = errorHandler({error, segmentEnt});

  const errorJsxComponent = new JsxNodeComponent(
    {props: {}, children: [errorJsx]},
    {component: Fragment}
  );

  // const errorHandler = getContextValue(getErrorContext(), parentContextEnt);

  // const errorJsx = errorHandler({error, segmentEnt});

  // const errorJsxComponent = new JsxNodeComponent(
  //   {props: {}, children: [errorJsx]},
  //   {component: Fragment}
  // );

  return errorJsxComponent;
};

// export const createErrorJsxNodeComponent = ({
//   error,
//   parentContextEnt,
//   segmentEnt,
// }: {
//   error: unknown;
//   parentContextEnt?: ContextEnt;
//   segmentEnt: SegmentEnt;
// }) => {
//   const errorHandler = getContextValue(getErrorContext(), parentContextEnt);

//   const errorJsx = errorHandler({error, segmentEnt});

//   const errorJsxComponent = new JsxNodeComponent(
//     {props: {}, children: [errorJsx]},
//     {component: Fragment}
//   );

//   return errorJsxComponent;
// };

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
        // jsxNode: listenerManager.segmentEnt.jsxNode,
        segmentEnt: listenerManager.segmentEnt,
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
      // jsxNode: hNode.segmentEnt.jsxNode,
      segmentEnt: hNode.segmentEnt,
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
  });
};
