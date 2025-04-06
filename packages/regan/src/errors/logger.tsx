import {JsxNode} from '../regan.ts';
import {FC} from '../types.ts';
import {ErrorCommanGuard, ErrorGuardHandler, ErrorGuardJsx} from './errors.tsx';
import {createErrorJsxNodeComponent} from './helpers.ts';

const logError = ({error, jsxNode}: {jsxNode: JsxNode; error: Error}) => {
  console.groupCollapsed(`regan: error: ${error.message}`);

  console.groupCollapsed('Stack');
  console.log(error);
  console.groupEnd();

  console.groupCollapsed('JsxNode');
  console.dir(jsxNode);
  console.groupEnd();

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
    <ErrorGuardJsx
      errorJsx={({error, jsxNode}) => {
        if (!checkValidError(error)) {
          return createErrorJsxNodeComponent(jsxNode, error);
        }
        logError({error, jsxNode});
        return createErrorJsxNodeComponent(jsxNode, error);
      }}
    >
      <ErrorGuardHandler
        errorHandler={({error, jsxNode}) => {
          if (!checkValidError(error)) {
            return;
          }
          logError({error, jsxNode});
        }}
      >
        <ErrorCommanGuard
          errorCommon={({error, jsxNode}) => {
            if (!checkValidError(error)) {
              return;
            }

            logError({error, jsxNode});
          }}
        >
          {children}
        </ErrorCommanGuard>
      </ErrorGuardHandler>
    </ErrorGuardJsx>
  );
};
