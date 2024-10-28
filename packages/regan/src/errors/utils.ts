import {getContextValue} from '../context/context.tsx';
import {Ctx} from '../ctx/ctx.ts';
import {errorContext} from './errors.tsx';
import {JsxNode} from '../node/node.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {SegmentComponent} from '../segments/component.ts';

export const prepareListenerForError = ({
  listener,
  // ctx,
  segmentEnt,
  segmentComponent,
}: {
  listener: (...args: any[]) => any;
  // ctx?: Ctx;
  segmentComponent?: SegmentComponent;
  segmentEnt: SegmentEnt;
}) => {
  return (...args: any[]) => {
    try {
      listener(...args);
    } catch (error) {
      const errorConfig = getContextValue(errorContext, segmentComponent?.ctx);
      errorConfig.error({error: error as Error, segmentEnt});
    }
  };
};
