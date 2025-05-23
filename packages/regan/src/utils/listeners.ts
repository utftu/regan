import {prepareListener} from '../errors/helpers.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {AnyFunc} from '../types.ts';

export type ListenerStore = {
  props: Record<string, AnyFunc>;
  segmentEnt: SegmentEnt;
};

export class LisneterManager {
  listeners: Record<string, AnyFunc> = {};
  segmentEnt: SegmentEnt;

  constructor(segmentEnt: SegmentEnt) {
    this.segmentEnt = segmentEnt;
  }

  add(element: Element, name: string, func: AnyFunc) {
    if (this.check(name)) {
      this.remove(element, name);
    }

    const preparedFuncForError = prepareListener({listenerManager: this, func});
    const preparedFunc = (...args: any[]) => {
      return preparedFuncForError(...args, element);
    };

    element.addEventListener(name, preparedFunc);

    this.listeners[name] = preparedFunc;
  }

  check(name: string) {
    return name in this.listeners;
  }

  remove(element: Element, name: string) {
    element.removeEventListener(name, this.listeners[name]);
    delete this.listeners[name];
  }
}
