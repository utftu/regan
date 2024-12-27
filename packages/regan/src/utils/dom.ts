import {DomPointerWithText, DomPointerElement} from '../types.ts';

export const addElementChildren = ({
  domPointer,
  elements,
}: {
  domPointer: DomPointerElement;
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

export const getElFromDomPointer = (domPointer: DomPointerWithText) => {
  return domPointer.parent.childNodes[domPointer.nodesCount];
};

export const getPrevTextNode = (
  customWindow: Window,
  parent: Element,
  nextElemPosition: number
) => {
  let childNodeToCheck;

  if (nextElemPosition === 0) {
    childNodeToCheck = parent.childNodes[0];
  } else {
    const prevEl = parent.children[nextElemPosition - 1];
    childNodeToCheck = prevEl.nextSibling;
  }

  while (
    childNodeToCheck &&
    childNodeToCheck.nodeType !== customWindow.document.ELEMENT_NODE
  ) {
    if (childNodeToCheck.nodeType === customWindow.document.TEXT_NODE) {
      return childNodeToCheck;
    }
    childNodeToCheck = childNodeToCheck.nextSibling;
  }
};

export const insertNodesAtPosition = (
  parent: Element,
  position: number,
  nodes: Node[]
) => {
  const children = parent.children;
  const insertPosition = position - 1; // Преобразуем позицию к индексу массива (от 0)

  // Определяем куда вставить: если позиция существует, вставляем перед элементом
  const referenceNode = children[insertPosition] || null;

  nodes.forEach((node) => {
    // Вставляем каждый элемент перед referenceNode (или в конец, если referenceNode === null)
    parent.insertBefore(node, referenceNode);
  });
};
