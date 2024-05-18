import {DomPointer} from '../types.ts';

export const addElementChildren = ({
  domPointer,
  elements,
}: {
  domPointer: DomPointer;
  prev?: HTMLElement | void;
  elements: (HTMLElement | string)[];
}) => {
  if (domPointer.position === 0) {
    domPointer.parent.prepend(...elements);
    return;
  }

  domPointer.parent.childNodes[domPointer.position - 1].after(...elements);
};

export const appendElementChild = ({
  parent,
  el,
}: {
  parent: HTMLElement;
  el: HTMLElement | string;
}) => {
  parent.append(el);
};

export const getElFromDomPointer = (domPointer: DomPointer) => {
  return domPointer.parent.childNodes[domPointer.position];
};
