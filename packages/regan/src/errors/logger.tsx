import {ErrorGurard} from '../components/error-guard.tsx';
import {FC} from '../types.ts';
import {ErrorRegan} from './errors.tsx';

export const logError = ({error}: {error: ErrorRegan}) => {
  console.group(`regan: error: ${error.message}`);

  console.groupCollapsed('Stack');
  console.log(error);
  console.groupEnd();

  if (
    typeof error.segmentEnt?.hNode?.globalCtx.clientCtx.window === 'undefined'
  ) {
    console.groupEnd();
    return;
  }

  console.groupCollapsed('SegmentEnt');
  console.dir(error.segmentEnt);
  console.groupEnd();

  if (error.segmentEnt.hNode) {
    console.groupCollapsed('HNode');
    console.dir(error.segmentEnt.hNode);
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
      handler={({error}) => {
        logError({error});
        throw error;
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
