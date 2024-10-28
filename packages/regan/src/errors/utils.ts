import {ContextEnt, getContextValue} from '../context/context.tsx';
import {errorContext} from './errors.tsx';
import {SegmentEnt} from '../segments/ent/ent.ts';

export const prepareListenerForError = ({
  listener,
  segmentEnt,
  contextEnt,
}: {
  listener: (...args: any[]) => any;
  segmentEnt: SegmentEnt;
  contextEnt: ContextEnt;
}) => {
  return (...args: any[]) => {
    try {
      listener(...args);
    } catch (error) {
      const errorConfig = getContextValue(errorContext, contextEnt);
      errorConfig.error({error: error as Error, segmentEnt});
    }
  };
};
