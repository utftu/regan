import {ContextEnt, getContextValue} from '../context/context.tsx';
import {getErrorContext} from '../errors/errors.tsx';
import {SegmentEnt} from '../segment/segment.ts';

export const handleError = ({
  error,
  segmentEnt,
}: {
  error: unknown;
  segmentEnt: SegmentEnt;
}) => {
  const errorHandler = getContextValue(
    getErrorContext(),
    segmentEnt.contextEnt
  );

  errorHandler({error, segmentEnt});
  throw error;
};

const handleErrorGuard = 
