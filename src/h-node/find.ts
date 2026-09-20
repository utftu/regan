import {HNodeElement} from './element.ts';
import {HNode} from './h-node.ts';

// Динамической области нужно знать, после какого dom-узла вставлять своё
// содержимое. Узнаётся это обходом дерева HNode вверх и влево.

// Последний dom-узел поддерева. Внутрь элемента не спускаемся: он сам и есть
// ответ, его дети лежат уже в нём, а не в искомом родителе.
const findLastDomNode = (hNode: HNode): ChildNode | undefined => {
  if (hNode.type === 'element') {
    return hNode.element;
  }

  if (hNode.type === 'text') {
    return hNode.textNode;
  }

  for (let i = hNode.children.length - 1; i >= 0; i--) {
    const domNode = findLastDomNode(hNode.children[i]);

    if (domNode) {
      return domNode;
    }
  }
};

// Ближайший dom-узел слева. Поднимаемся к родителю и осматриваем его детей
// левее себя; элемент — граница, за ним начинается другой dom-родитель.
//
// lastParentHNode — родитель, на котором обход остановился. Если dom-узла
// слева не нашлось, вставлять придётся в начало этого родителя.
export const findPrevDomNode = (
  hNode: HNode
): {domNode?: ChildNode; lastParentHNode?: HNode} => {
  let current = hNode;
  let lastParentHNode: HNode | undefined;

  while (current.parent) {
    const parent = current.parent;
    lastParentHNode = parent;

    const position = parent.children.indexOf(current);

    for (let i = position - 1; i >= 0; i--) {
      const domNode = findLastDomNode(parent.children[i]);

      if (domNode) {
        return {domNode, lastParentHNode};
      }
    }

    if (parent.type === 'element') {
      return {lastParentHNode};
    }

    current = parent;
  }

  return {lastParentHNode};
};

// Ближайший элемент вверх по дереву — в него и вставляем, если слева пусто.
export const getTopHNodeElement = (hNode: HNode): HNodeElement | undefined => {
  if (hNode.type === 'element') {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return getTopHNodeElement(hNode.parent);
};
