import {LisneterManager} from './funcs.ts';

export const createExec = ({
  name,
  element,

  listenerManager,
}: {
  name: string;
  element: Element;
  listenerManager: LisneterManager;
}) => {
  const exec = (value: any) => {
    listenerManager.remove(element, name);

    if (typeof value === 'function') {
      listenerManager.add(element, name, value);
    } else {
      element.setAttribute(name, value);
    }
  };
  return exec;
};
