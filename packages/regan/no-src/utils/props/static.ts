import {LisneterManager} from './funcs.ts';

type StaticProps = Record<string, any>;

export const initStaticProps = (
  element: HTMLElement,
  staticProps: StaticProps,
  listenerManager: LisneterManager
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    if (typeof value === 'function') {
      listenerManager.add(element, name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
};
