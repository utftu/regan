import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {unmountHNodes} from '../h-node/helpers.ts';
import {RenderNode, RenderNodeDom} from '../render/node.ts';
import {InsertPoint} from '../types.ts';
import {checkClassChild} from '../utils/check-parent.ts';

type HNodeDom = HNodeElement | HNodeText;

// куда класть следующий узел внутри одного dom-родителя;
// компонентные узлы dom не создают, поэтому делят курсор с родителем
type Cursor = {prevNode?: ChildNode};

const getDomNode = (hNode: HNodeDom): ChildNode => {
  if (checkClassChild(hNode, 'hNodeText')) {
    return hNode.textNode;
  }
  return (hNode as HNodeElement).element;
};

// верхние dom-узлы поддерева: у компонента своего узла нет,
// поэтому спускаемся до первых настоящих
const collectDomNodes = (hNode: HNode, store: ChildNode[] = []) => {
  if (checkClassChild(hNode, 'hNodeElement')) {
    store.push(hNode.element);
    return store;
  }

  if (checkClassChild(hNode, 'hNodeText')) {
    store.push(hNode.textNode);
    return store;
  }

  hNode.children.forEach((child) => collectDomNodes(child, store));

  return store;
};

const createDomNode = (renderNode: RenderNodeDom, window: Window): ChildNode => {
  if (renderNode.type === 'text') {
    return window.document.createTextNode(renderNode.text);
  }

  const element = window.document.createElement(renderNode.tag);

  for (const name in renderNode.props) {
    const value = renderNode.props[name];

    if (typeof value === 'function') {
      renderNode.listenerManager.add(element, name, value);
    } else {
      element.setAttribute(name, value);
    }
  }

  if (renderNode.rawHtml) {
    element.innerHTML = renderNode.rawHtml;
  }

  return element;
};

const createHNode = (renderNode: RenderNodeDom, domNode: ChildNode): HNodeDom => {
  const base = {
    globalCtx: renderNode.globalCtx,
    segmentEnt: renderNode.segmentEnt,
    mounts: renderNode.mounts,
    unmounts: renderNode.unmounts,
  };

  const hNode =
    renderNode.type === 'text'
      ? new HNodeText(base, {text: renderNode.text, textNode: domNode as Text})
      : new HNodeElement(base, {
          element: domNode as Element,
          tag: renderNode.tag,
          props: renderNode.props,
          listenerManager: renderNode.listenerManager,
        });

  renderNode.segmentEnt.hNode = hNode;

  return hNode;
};

// ставит узел на нужное место; для уже вставленного узла after/prepend
// работают как перенос, поэтому отдельная ветка на перемещение не нужна
const placeNode = (node: ChildNode, insertPoint: InsertPoint) => {
  const expected = insertPoint.prevNode
    ? insertPoint.prevNode.nextSibling
    : insertPoint.parent.firstChild;

  if (expected === node) {
    return;
  }

  if (insertPoint.prevNode) {
    insertPoint.prevNode.after(node);
    return;
  }

  insertPoint.parent.prepend(node);
};

const patchProps = (renderNode: RenderNodeDom, hNode: HNodeElement) => {
  if (renderNode.type !== 'element') {
    return;
  }

  const element = hNode.element;

  for (const name in hNode.props) {
    if (name in renderNode.props) {
      continue;
    }

    if (typeof hNode.props[name] === 'function') {
      hNode.listenerManager.remove(element, name);
    } else {
      element.removeAttribute(name);
    }
  }

  for (const name in renderNode.props) {
    const value = renderNode.props[name];

    // обработчик переезжает в новый менеджер всегда, даже если это та же
    // функция: иначе старый менеджер снимет его с элемента при размонтировании
    if (value === hNode.props[name] && typeof value !== 'function') {
      continue;
    }

    if (typeof value === 'function') {
      hNode.listenerManager.remove(element, name);
      renderNode.listenerManager.add(element, name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
};

type HandleResult = {
  hNode: HNodeDom;
  oldChildren: HNode[];
};

const handleNode = ({
  renderNode,
  hNode,
  window,
}: {
  renderNode: RenderNodeDom;
  hNode?: HNodeDom;
  window: Window;
}): HandleResult => {
  if (!hNode) {
    const domNode = createDomNode(renderNode, window);

    return {hNode: createHNode(renderNode, domNode), oldChildren: []};
  }

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

// у компонента своего dom нет, поэтому удаляется всё, что он собой накрыл
const removeDomNode = (hNode: HNode) => {
  if (checkClassChild(hNode, 'hNodeElement')) {
    hNode.listenerManager.cleanup();
    hNode.element.remove();
    return;
  }

  if (checkClassChild(hNode, 'hNodeText')) {
    hNode.textNode.remove();
    return;
  }

  hNode.children.forEach(removeDomNode);
};

const removeHNode = (hNode: HNode) => {
  unmountHNodes(hNode);
  removeDomNode(hNode);
};

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
  created: HNode[];
}): HNode[] => {
  // пары подобраны на рендере, здесь остаётся убрать то, чему пары не нашлось
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

    // сохранённое поддерево не трогаем вообще: ни размонтирования,
    // ни рендера его не касались, осталось только переставить dom
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
      // старый компонент отработал: дальше живёт новый hNode
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
      window,
    });
    hNode.parent = parentHNode;
    created.push(hNode);

    // размонтирование после патча пропов: к этому моменту слушатели уже
    // переехали в новый менеджер, и старый ничего лишнего не снимет
    oldHNode?.unmount();

    const insertPoint = {parent: parentDomNode, prevNode: cursor.prevNode};
    const domNode = getDomNode(hNode);
    cursor.prevNode = domNode;

    if (renderNode.type === 'element') {
      hNode.children = applyChildren({
        renderNodes: renderNode.children,
        oldHNodes: oldChildren,
        parentDomNode: (hNode as HNodeElement).element,
        cursor: {},
        window,
        parentHNode: hNode,
        created,
      });
    }

    // вставка после сборки детей: новый узел всё это время отсоединён,
    // и в живой DOM попадает один раз, целиком
    placeNode(domNode, insertPoint);

    return hNode;
  });
};

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
  // монтировать надо только то, что действительно создано: сохранённые
  // поддеревья уже смонтированы и второй раз этого не переживут
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
