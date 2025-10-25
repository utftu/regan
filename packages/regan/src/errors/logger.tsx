import {ErrorGurard} from '../components/error-guard.tsx';
import {JsxNode} from '../regan.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {FC} from '../types.ts';
// import {ErrorCommanGuard, ErrorGuardHandler, ErrorGuardJsx} from './errors.tsx';

const logError = ({
  error,
  // jsxNode,
  segmentEnt,
}: {
  // jsxNode: JsxNode;
  error: Error;
  segmentEnt: SegmentEnt;
}) => {
  console.group(`regan: error: ${error.message}`);

  console.groupCollapsed('Stack');
  console.log(error);
  console.groupEnd();

  if (typeof segmentEnt.hNode?.globalCtx.clientCtx.window === 'undefined') {
    console.groupEnd();
    return;
  }

  console.groupCollapsed('SegmentEnt');
  console.dir(segmentEnt);
  console.groupEnd();

  if (segmentEnt.hNode) {
    console.groupCollapsed('HNode');
    console.dir(segmentEnt.hNode);
    console.groupEnd();
  }

  console.groupEnd();
};

const checkValidError = (error: unknown): error is Error => {
  if (error instanceof Error) {
    return true;
  }

  console.error('regan: regan: (invalid error) ', error);
  return false;
};

export const ErrorLogger: FC<{enabled?: boolean}> = (
  {enabled = true},
  {children}
) => {
  if (enabled === false) {
    return children;
  }
  return (
    <ErrorGurard
      handler={({error, segmentEnt}) => {
        if (!checkValidError(error)) {
          return createErrorJsxNodeComponent(error);
        }
        logError({error, jsxNode});
        return createErrorJsxNodeComponent(jsxNode, error);
      }}
    >
      {children}
    </ErrorGurard>
  );
  // return (
  //   <ErrorGuardJsx
  //     errorJsx={({error, jsxNode}) => {
  //       if (!checkValidError(error)) {
  //         return createErrorJsxNodeComponent(jsxNode, error);
  //       }
  //       logError({error, jsxNode});
  //       return createErrorJsxNodeComponent(jsxNode, error);
  //     }}
  //   >
  //     <ErrorGuardHandler
  //       errorHandler={({error, jsxNode}) => {
  //         if (!checkValidError(error)) {
  //           return;
  //         }
  //         logError({error, jsxNode});
  //       }}
  //     >
  //       <ErrorCommanGuard
  //         errorCommon={({error, jsxNode}) => {
  //           if (!checkValidError(error)) {
  //             return;
  //           }

  //           logError({error, jsxNode});
  //         }}
  //       >
  //         {children}
  //       </ErrorCommanGuard>
  //     </ErrorGuardHandler>
  //   </ErrorGuardJsx>
  // );
};
