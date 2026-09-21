import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {RenderNode, RenderNodeDom} from './node.ts';
import {InsertPoint} from '../types.ts';
import {
  collectDomNodes,
  createDomNode,
  createHNode,
  getDomNode,
  HNodeDom,
  patchProps,
  placeNode,
  removeHNode,
} from './dom.ts';

// Единственное место, которое трогает DOM на клиенте.
//
// На вход — дерево RenderNode, свежий результат рендера. Каждый его узел уже
// знает свою пару в прошлом дереве (`renderNode.oldHNode`): сопоставлением
// занимается render/align.ts, здесь ничего не решается. На выход — дерево
// HNode, которое станет «прошлым» для следующего обновления.
//
// Работы ровно четыре:
//   1. удалить старые узлы, которым пары не нашлось;
//   2. переиспользовать те, у кого пара есть (пропатчить пропы или текст);
//   3. создать недостающие;
//   4. расставить всё по порядку.

// Позиция внутри одного dom-родителя: узел, после которого класть следующий.
// Курсор общий на весь список детей этого родителя. Компонент своего dom-узла
// не создаёт, поэтому он курсор не заводит, а пишет в родительский —
// компонент из трёх элементов подвинет курсор трижды.
type Cursor = {prevNode?: ChildNode};

type HandleResult = {
  hNode: HNodeDom;
  // дети старого элемента — их сверит рекурсивный вызов;
  // у созданного заново и у текста сверять нечего
  oldChildren: HNode[];
};

// Приводит один dom-несущий узел в нужное состояние, но не вставляет его.
// Если пары нет — создаёт. Если есть — она гарантированно того же вида
// и того же тега: несовместимые пары отсеял align, до сюда они не доходят.
const handleNode = ({
  renderNode,
  hNode,
  parentDomNode,
  window,
}: {
  renderNode: RenderNodeDom;
  hNode?: HNodeDom;
  parentDomNode: ParentNode | Document;
  window: Window;
}): HandleResult => {
  if (!hNode) {
    const domNode = createDomNode(renderNode, parentDomNode, window);

    return {hNode: createHNode(renderNode, domNode), oldChildren: []};
  }

  // Пара того же вида — это гарантия align, отдельно её здесь не проверяем.
  if (renderNode.type === 'text') {
    const hNodeText = hNode as HNodeText;

    if (hNodeText.text !== renderNode.text) {
      hNodeText.textNode.textContent = renderNode.text;
    }

    return {
      hNode: createHNode(renderNode, hNodeText.textNode),
      oldChildren: [],
    };
  }

  const hNodeElement = hNode as HNodeElement;
  patchProps(renderNode, hNodeElement);

  return {
    hNode: createHNode(renderNode, hNodeElement.element),
    oldChildren: hNodeElement.children,
  };
};

// Обрабатывает один список детей. Рекурсия идёт по дереву RenderNode;
// element заводит новый курсор (он сам себе dom-родитель),
// component передаёт дальше родительский.
const applyChildren = ({
  renderNodes,
  oldHNodes,
  parentDomNode,
  cursor,
  window,
  parentHNode,
  created,
}: {
  renderNodes: RenderNode[];
  oldHNodes: HNode[];
  parentDomNode: ParentNode | Document;
  cursor: Cursor;
  window: Window;
  parentHNode?: HNode;
  // плоский список созданных узлов, общий на весь обход: монтирует их
  // вызывающий, когда дерево уже собрано целиком
  created: HNode[];
}): HNode[] => {
  // Пары подобраны на рендере, здесь остаётся убрать то, чему пары не нашлось.
  // Делаем это до расстановки: удалённые узлы не должны попадаться курсору
  // как соседи.
  if (oldHNodes.length) {
    const used = new Set(renderNodes.map((renderNode) => renderNode.oldHNode));

    for (const oldHNode of oldHNodes) {
      if (used.has(oldHNode) === false) {
        removeHNode(oldHNode);
      }
    }
  }

  return renderNodes.map((renderNode) => {
    const oldHNode = renderNode.oldHNode;

    // Компонент с тем же ключом: его не перезапускали на рендере, и здесь
    // тоже не трогаем — ни размонтирования, ни новых HNode. Всё, что нужно, —
    // переставить его dom-узлы и переподвесить на нового родителя, иначе
    // вложенная динамическая область при вставке пойдёт по мёртвой цепочке.
    if (renderNode.type === 'keep') {
      const keptHNode = renderNode.oldHNode;
      keptHNode.parent = parentHNode;

      for (const domNode of collectDomNodes(keptHNode)) {
        placeNode(domNode, {parent: parentDomNode, prevNode: cursor.prevNode});
        cursor.prevNode = domNode;
      }

      return keptHNode;
    }

    if (renderNode.type === 'component') {
      // старый компонент отработал: дальше живёт новый hNode.
      // размонтирование здесь нерекурсивное — до детей дойдёт свой вызов
      oldHNode?.unmount();

      const hNode = new HNodeComponent({
        globalCtx: renderNode.globalCtx,
        segmentEnt: renderNode.segmentEnt,
        mounts: renderNode.mounts,
        unmounts: renderNode.unmounts,
        parent: parentHNode,
      });
      renderNode.segmentEnt.hNode = hNode;
      created.push(hNode);

      // курсор и dom-родитель те же: компонент в dom не существует
      hNode.children = applyChildren({
        renderNodes: renderNode.children,
        oldHNodes: oldHNode ? oldHNode.children : [],
        parentDomNode,
        cursor,
        window,
        parentHNode: hNode,
        created,
      });

      return hNode;
    }

    const {hNode, oldChildren} = handleNode({
      renderNode,
      hNode: oldHNode as HNodeDom | undefined,
      parentDomNode,
      window,
    });
    hNode.parent = parentHNode;
    created.push(hNode);

    // размонтирование после патча пропов: к этому моменту слушатели уже
    // переехали в новый менеджер, и старый ничего лишнего не снимет
    oldHNode?.unmount();

    // Место запоминаем сейчас, а вставляем в конце: пока собираются дети,
    // курсор уже должен показывать на этот узел — иначе следующий сосед
    // встанет не за ним.
    const insertPoint = {parent: parentDomNode, prevNode: cursor.prevNode};
    const domNode = getDomNode(hNode);
    cursor.prevNode = domNode;

    if (renderNode.type === 'element') {
      hNode.children = applyChildren({
        renderNodes: renderNode.children,
        oldHNodes: oldChildren,
        // элемент — свой dom-родитель, и нумерация детей в нём начинается
        // с нуля, поэтому курсор новый
        parentDomNode: (hNode as HNodeElement).element,
        cursor: {},
        window,
        parentHNode: hNode,
        created,
      });
    }

    // Вставка после сборки детей. Созданный узел всё это время висел
    // отдельно, дети добавлялись в отсоединённое поддерево, и в живой DOM
    // оно попадает один раз, целиком. Переиспользованный узел уже на месте —
    // для него placeNode либо ничего не сделает, либо подвинет.
    placeNode(domNode, insertPoint);

    return hNode;
  });
};

// Точка входа: первый рендер (oldHNodes пустой) и обновление динамической
// области. Возвращает новое дерево и отдельно — список созданных узлов:
// монтировать надо только их, сохранённые поддеревья уже смонтированы.
export const applyRenderNodes = ({
  renderNodes,
  oldHNodes,
  insertPoint,
  window,
  parent,
}: {
  renderNodes: RenderNode[];
  oldHNodes: HNode[];
  insertPoint: InsertPoint;
  window: Window;
  parent?: HNode;
}) => {
  const created: HNode[] = [];

  const hNodes = applyChildren({
    renderNodes,
    oldHNodes,
    parentDomNode: insertPoint.parent,
    cursor: {prevNode: insertPoint.prevNode},
    window,
    parentHNode: parent,
    created,
  });

  return {hNodes, created};
};
