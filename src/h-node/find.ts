import {HNodeElement} from './element.ts';
import {HNode} from './h-node.ts';

// Поиск по дереву HNode вверх и влево — так динамическая область выясняет,
// после какого dom-узла ей вставлять своё содержимое.

// HNode — нашли
// 'stop' — дальше не искать
// void — продолжать искать
export type CheckerAnswer = HNode | 'stop' | void;

export type Checker = (hNode: HNode) => CheckerAnswer;

export type Config = {
  lastParentHNode?: HNode;
};

// Ответ чекера: узел найден, если это не 'stop' и не «продолжай искать».
const checkFound = (answer: CheckerAnswer): answer is HNode => {
  return answer !== undefined && answer !== 'stop';
};

const findPrevDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const checkerAnswer = checker(hNode);

  if (checkFound(checkerAnswer)) {
    return hNode;
  }

  if (checkerAnswer === 'stop') {
    return 'stop';
  }

  for (let i = hNode.children.length - 1; i >= 0; i--) {
    const child = hNode.children[i];

    const downAnswer = findPrevDown(child, checker);

    if (checkFound(downAnswer)) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};

// Поднимаемся к родителю и осматриваем его детей левее себя.
// Элемент — граница: всё, что за ним, лежит уже в другом dom-родителе.
const findPrevUp = (
  hNode: HNode,
  checker: Checker,
  config: Config
): CheckerAnswer => {
  const checkingHNode = hNode.parent;

  if (!checkingHNode) {
    return;
  }

  config.lastParentHNode = checkingHNode;

  const childPosition = checkingHNode.children.indexOf(hNode);

  for (let i = childPosition - 1; i >= 0; i--) {
    const child = checkingHNode.children[i];

    const downAnswer = findPrevDown(child, checker);
    if (checkFound(downAnswer)) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return;
    }
  }

  if (checkingHNode.type === 'element') {
    return;
  }

  return findPrevUp(checkingHNode, checker, config);
};

export const findPrevHNode = (
  hNode: HNode,
  checker: Checker,
  config: Config = {}
) => {
  const result = findPrevUp(hNode, checker, config);

  if (checkFound(result)) {
    return result;
  }
};

// Ближайший dom-узел слева и родитель, на котором поиск остановился.
export const findPrevDomNodeHNode = (
  hNode: HNode
): {domNode?: ChildNode; lastParentHNode?: HNode} => {
  const config: Config = {};

  const result = findPrevHNode(
    hNode,
    (hNode) => {
      if (hNode.type === 'element') {
        return hNode;
      }

      if (hNode.type === 'text') {
        return hNode;
      }
    },
    config
  );

  if (result?.type === 'element') {
    return {domNode: result.element, lastParentHNode: config.lastParentHNode};
  }

  if (result?.type === 'text') {
    return {domNode: result.textNode, lastParentHNode: config.lastParentHNode};
  }

  return {lastParentHNode: config.lastParentHNode};
};

// Ближайший элемент вверх по дереву — в него и вставляем, если слева пусто.
export const getTopHNodeElement = (hNode: HNode): HNodeElement | void => {
  if (hNode.type === 'element') {
    return hNode;
  }

  if (!hNode.parent) {
    return;
  }

  return getTopHNodeElement(hNode.parent);
};
