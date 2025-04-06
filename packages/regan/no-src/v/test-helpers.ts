import {DomPointer} from '../types.ts';

export const createParent = (window: Window) => {
  const div = window.document.createElement('div');
  return div;
};

export const createDomPointer = (window: Window): DomPointer => {
  const parent = createParent(window);
  return {
    parent,
    nodeCount: 0,
  };
};
