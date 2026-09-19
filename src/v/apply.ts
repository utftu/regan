import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
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

// ключ живёт в jsx-узле, а на него ссылаются обе стороны сравнения:
// и свежий renderNode, и старый hNode (хоть из рендера, хоть из гидратации).
// У текста segmentEnt родительский, поэтому ключа у него быть не может.
const getRenderNodeKey = (renderNode: RenderNode) => {
  if (renderNode.type === 'text') {
    return;
  }
  return renderNode.segmentEnt.jsxNode.systemProps.key;
};

const getHNodeKey = (hNode: HNode) => {
  if (checkClassChild(hNode, 'hNodeText')) {
    return;
  }
  return hNode.segmentEnt?.jsxNode.systemProps.key;
};

const checkSameType = (renderNode: RenderNode, hNode: HNode) => {
  if (renderNode.type === 'component') {
    return checkClassChild(hNode, 'hNodeComponent');
  }
  if (renderNode.type === 'text') {
    return checkClassChild(hNode, 'hNodeText');
  }
  return checkClassChild(hNode, 'hNodeElement');
};

type Pair = {renderNode: RenderNode; oldHNode?: HNode};

// Сопоставляет новых детей со старыми. Без ключей это сравнение по позиции,
// с ключами узел находит свою пару, даже если переехал.
const align = (renderNodes: RenderNode[], oldHNodes: HNode[]) => {
  let keyed: Map<string, HNode> | undefined;

  for (const oldHNode of oldHNodes) {
    const key = getHNodeKey(oldHNode);

    if (key === undefined) {
      continue;
    }

    keyed ??= new Map();
    // при дублях выигрывает первый — так же, как при сравнении по позиции
    if (keyed.has(key) === false) {
      keyed.set(key, oldHNode);
    }
  }

  if (!keyed) {
    const pairs: Pair[] = renderNodes.map((renderNode, index) => ({
      renderNode,
      oldHNode: oldHNodes[index],
    }));

    return {pairs, removed: oldHNodes.slice(renderNodes.length)};
  }

  const used = new Set<HNode>();
  const pairs: Pair[] = [];
  let index = 0;

  for (const renderNode of renderNodes) {
    const key = getRenderNodeKey(renderNode);

    if (key !== undefined) {
      const oldHNode = keyed.get(key);

      const found =
        oldHNode && !used.has(oldHNode) && checkSameType(renderNode, oldHNode);

      if (found) {
        used.add(oldHNode);
        pairs.push({renderNode, oldHNode});
      } else {
        pairs.push({renderNode});
      }

      continue;
    }

    // узел без ключа берёт следующий свободный старый — тоже без ключа,
    // иначе он забрал бы чужую пару
    while (
      index < oldHNodes.length &&
      (used.has(oldHNodes[index]) || getHNodeKey(oldHNodes[index]) !== undefined)
    ) {
      index++;
    }

    const oldHNode = oldHNodes[index];

    if (oldHNode) {
      used.add(oldHNode);
      index++;
    }

    pairs.push({renderNode, oldHNode});
  }

  return {pairs, removed: oldHNodes.filter((oldHNode) => !used.has(oldHNode))};
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

    if (value === hNode.props[name]) {
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

const checkReplace = (renderNode: RenderNodeDom, hNode: HNodeDom) => {
  if (renderNode.type === 'text') {
    return checkClassChild(hNode, 'hNodeText') === false;
  }

  if (checkClassChild(hNode, 'hNodeElement') === false) {
    return true;
  }

  if ((hNode as HNodeElement).tag !== renderNode.tag) {
    return true;
  }

  return typeof renderNode.rawHtml === 'string';
};

type HandleResult = {
  hNode: HNodeDom;
  oldChildren: HNode[];
};

const handleNode = ({
  renderNode,
  hNode,
  window,
  insertPoint,
}: {
  renderNode: RenderNodeDom;
  hNode?: HNodeDom;
  window: Window;
  insertPoint: InsertPoint;
}): HandleResult => {
  if (!hNode) {
    const domNode = createDomNode(renderNode, window);
    placeNode(domNode, insertPoint);

    return {hNode: createHNode(renderNode, domNode), oldChildren: []};
  }

  if (checkReplace(renderNode, hNode)) {
    if (checkClassChild(hNode, 'hNodeElement')) {
      hNode.listenerManager.cleanup();
    }

    const domNode = createDomNode(renderNode, window);
    getDomNode(hNode).replaceWith(domNode);
    placeNode(domNode, insertPoint);

    return {hNode: createHNode(renderNode, domNode), oldChildren: []};
  }

  if (renderNode.type === 'text') {
    const hNodeText = hNode as HNodeText;

    if (hNodeText.text !== renderNode.text) {
      hNodeText.textNode.textContent = renderNode.text;
    }

    placeNode(hNodeText.textNode, insertPoint);

    return {
      hNode: createHNode(renderNode, hNodeText.textNode),
      oldChildren: [],
    };
  }

  const hNodeElement = hNode as HNodeElement;
  patchProps(renderNode, hNodeElement);
  placeNode(hNodeElement.element, insertPoint);

  return {
    hNode: createHNode(renderNode, hNodeElement.element),
    oldChildren: hNodeElement.children,
  };
};

// у компонента своего dom нет, поэтому удаляется всё, что он собой накрыл
const removeHNode = (hNode: HNode) => {
  if (checkClassChild(hNode, 'hNodeElement')) {
    hNode.listenerManager.cleanup();
    hNode.element.remove();
    return;
  }

  if (checkClassChild(hNode, 'hNodeText')) {
    hNode.textNode.remove();
    return;
  }

  hNode.children.forEach(removeHNode);
};

const applyChildren = ({
  renderNodes,
  oldHNodes,
  parentDomNode,
  cursor,
  window,
  parentHNode,
}: {
  renderNodes: RenderNode[];
  oldHNodes: HNode[];
  parentDomNode: ParentNode | Document;
  cursor: Cursor;
  window: Window;
  parentHNode?: HNode;
}): HNode[] => {
  const {pairs, removed} = align(renderNodes, oldHNodes);

  removed.forEach(removeHNode);

  return pairs.map(({renderNode, oldHNode}) => {
    if (renderNode.type === 'component') {
      const hNode = new HNodeComponent({
        globalCtx: renderNode.globalCtx,
        segmentEnt: renderNode.segmentEnt,
        mounts: renderNode.mounts,
        unmounts: renderNode.unmounts,
        parent: parentHNode,
      });
      renderNode.segmentEnt.hNode = hNode;

      hNode.children = applyChildren({
        renderNodes: renderNode.children,
        oldHNodes: oldHNode ? oldHNode.children : [],
        parentDomNode,
        cursor,
        window,
        parentHNode: hNode,
      });

      return hNode;
    }

    const {hNode, oldChildren} = handleNode({
      renderNode,
      hNode: oldHNode as HNodeDom | undefined,
      window,
      insertPoint: {parent: parentDomNode, prevNode: cursor.prevNode},
    });
    hNode.parent = parentHNode;
    cursor.prevNode = getDomNode(hNode);

    if (renderNode.type === 'element') {
      hNode.children = applyChildren({
        renderNodes: renderNode.children,
        oldHNodes: oldChildren,
        parentDomNode: (hNode as HNodeElement).element,
        cursor: {},
        window,
        parentHNode: hNode,
      });
    }

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
}): HNode[] => {
  return applyChildren({
    renderNodes,
    oldHNodes,
    parentDomNode: insertPoint.parent,
    cursor: {prevNode: insertPoint.prevNode},
    window,
    parentHNode: parent,
  });
};
