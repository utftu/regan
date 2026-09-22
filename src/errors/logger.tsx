import {ErrorGuard} from '../components/error-guard.tsx';
import {FC} from '../types.ts';
import {ErrorRegan} from './errors.ts';

// Единственный потребитель — ErrorLogger ниже. Наружу не отдаём: у handle.ts
// был на него завязан признак «не перехватил», и это ломало разделение
// обязанностей.
const logError = ({error}: {error: ErrorRegan}) => {
  console.group(`regan: error: ${error.message}`);

  if (error.path) {
    console.log(`место: ${error.path}`);
  }

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

export const ErrorLogger: FC<{enabled?: boolean}> = (
  {enabled = true},
  {children},
) => {
  if (enabled === false) {
    return children;
  }
  return (
    <ErrorGuard
      handler={({error}) => {
        logError({error});
        throw error;
      }}
    >
      {children}
    </ErrorGuard>
  );
};

ErrorLogger.reganInternal = true;
