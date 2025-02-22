import {ContextEnt, getContextValue} from '../context/context.tsx';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {errorContextHandler} from './errors.tsx';

export const prepareListenerForError = ({
  listener,
  segmentEnt,
  contextEnt,
}: {
  listener: (...args: any[]) => any;
  segmentEnt: SegmentEnt;
  contextEnt?: ContextEnt;
}) => {
  return (...args: any[]) => {
    try {
      listener(...args);
    } catch (error) {
      const errorhandler = getContextValue(errorContextHandler, contextEnt);
      errorhandler({error: error as Error, jsxNode: segmentEnt.jsxNode});
    }
  };
};
