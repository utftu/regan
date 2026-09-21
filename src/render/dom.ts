import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {unmountHNodes} from '../h-node/helpers.ts';
import {RenderNodeDom} from './node.ts';
import {InsertPoint} from '../types.ts';
import {getAttributeValue} from '../utils/attributes.ts';

// Всё, что делается с самим DOM: создать узел, поставить его на место,
// пропатчить пропы, убрать. В каком порядке это происходит — в apply.ts.

export type HNodeDom = HNodeElement | HNodeText;

export const getDomNode = (hNode: HNodeDom): ChildNode => {
  if (hNode.type === 'text') {
    return hNode.textNode;
  }

  return hNode.element;
};

// Верхние dom-узлы поддерева — те, что лежат прямо в родителе.
// У компонента своего узла нет, поэтому спускаемся до первых настоящих;
// вглубь элемента не идём, его дети переедут вместе с ним.
export const collectDomNodes = (hNode: HNode, store: ChildNode[] = []) => {
  if (hNode.type === 'element') {
    store.push(hNode.element);
    return store;
  }

  if (hNode.type === 'text') {
    store.push(hNode.textNode);
    return store;
  }

  hNode.children.forEach((child) => collectDomNodes(child, store));

  return store;
};

const svgNamespace = 'http://www.w3.org/2000/svg';

// Внутри <svg> элементы живут в своём пространстве имён, и через
// createElement их не создать — выйдет html-элемент с тем же именем, который
// браузер не нарисует. Родитель к этому моменту уже создан, поэтому
// достаточно спросить его: вложенность разбирается сама.
const createElement = (
  tag: string,
  parentDomNode: ParentNode | Document,
  window: Window,
) => {
  if (
    tag === 'svg' ||
    (parentDomNode as Element).namespaceURI === svgNamespace
  ) {
    return window.document.createElementNS(svgNamespace, tag);
  }

  return window.document.createElement(tag);
};

// Узел создаётся отсоединённым: ни в каком родителе его сейчас нет.
// Вставит его вызывающий, позже, когда соберёт детей.
export const createDomNode = (
  renderNode: RenderNodeDom,
  parentDomNode: ParentNode | Document,
  window: Window,
): ChildNode => {
  if (renderNode.type === 'text') {
    return window.document.createTextNode(renderNode.text);
  }

  const element = createElement(renderNode.tag, parentDomNode, window);

  for (const name in renderNode.props) {
    const value = renderNode.props[name];

    if (typeof value === 'function') {
      renderNode.listenerManager.add(element, name, value);
      continue;
    }

    const attributeValue = getAttributeValue(name, value);

    if (attributeValue !== undefined) {
      element.setAttribute(name, attributeValue);
    }
  }

  if (renderNode.rawHtml) {
    element.innerHTML = renderNode.rawHtml;
  }

  return element;
};

// HNode заводится заново на каждое обновление, даже когда dom-узел
// переиспользован: у нового узла свои mounts/unmounts и свой снимок пропов.
// segmentEnt.hNode переставляется на свежий — по нему ищут узел снаружи.
export const createHNode = (
  renderNode: RenderNodeDom,
  domNode: ChildNode,
): HNodeDom => {
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

// Ставит узел на нужное место — и это же перемещение.
// after/prepend на уже вставленном узле переносят его, поэтому отдельной
// ветки на «подвинуть» не нужно. Сверка с ожидаемым соседом нужна, чтобы не
// трогать dom там, где узел и так стоит правильно: на списке без перестановок
// это ноль операций.
export const placeNode = (node: ChildNode, insertPoint: InsertPoint) => {
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

// Сверяем снимок пропов со старого HNode с новым набором.
// Первый проход убирает то, чего больше нет, второй — ставит изменившееся.
export const patchProps = (renderNode: RenderNodeDom, hNode: HNodeElement) => {
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
      continue;
    }

    const attributeValue = getAttributeValue(name, value);

    if (attributeValue === undefined) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, attributeValue);
    }
  }
};

// У компонента своего dom нет, поэтому удаляется всё, что он собой накрыл.
// В элемент не спускаемся: его дети уходят вместе с ним.
const removeDomNode = (hNode: HNode) => {
  if (hNode.type === 'element') {
    hNode.listenerManager.cleanup();
    hNode.element.remove();
    return;
  }

  if (hNode.type === 'text') {
    hNode.textNode.remove();
    return;
  }

  hNode.children.forEach(removeDomNode);
};

// Размонтирование рекурсивное: уходит всё поддерево, значит и его подписки.
export const removeHNode = (hNode: HNode) => {
  unmountHNodes(hNode);
  removeDomNode(hNode);
};
