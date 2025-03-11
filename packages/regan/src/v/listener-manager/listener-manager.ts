import {AnyFunc} from '../../types.ts';

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

    const preparedFunc = this.prepare(func);

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

  prepare(func: AnyFunc) {
    const self = this;
    return async (...args: any[]) => {
      const errorHandler = getContextValue(
        errorContextHandler,
        self.segmentEnt.parentContextEnt
      );
      try {
        await func(...args);
      } catch (error) {
        errorHandler({error, jsxNode: self.segmentEnt.jsxNode});
      }
    };
  }
}
