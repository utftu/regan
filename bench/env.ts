import {JSDOM} from 'jsdom';

// Общее окружение для замеров: jsdom подставляется в глобальные объекты,
// иначе React и Solid не находят document.
export const jsdom = new JSDOM('<!doctype html><html><body></body></html>');

const globals = globalThis as any;

globals.window = jsdom.window;
globals.document = jsdom.window.document;
globals.HTMLElement = jsdom.window.HTMLElement;
globals.Node = jsdom.window.Node;
globals.Element = jsdom.window.Element;
globals.IS_REACT_ACT_ENVIRONMENT = false;

Object.defineProperty(globalThis, 'navigator', {
  value: jsdom.window.navigator,
  configurable: true,
});

export const document = jsdom.window.document;

export const makeContainer = () => {
  const element = document.createElement('div');
  document.body.append(element);

  return element;
};

export const flush = () => new Promise((resolve) => queueMicrotask(resolve));

export const wait = () => new Promise((resolve) => setTimeout(resolve, 0));

// Среднее время одного прогона.
export const measure = async (
  run: (index: number) => any,
  times: number,
): Promise<number> => {
  const start = performance.now();

  for (let i = 0; i < times; i++) {
    await run(i);
  }

  return (performance.now() - start) / times;
};

export const getCount = (fallback: number) => {
  return Number(process.argv[2] ?? fallback);
};
