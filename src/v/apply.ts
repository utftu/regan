import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {RenderNode, RenderNodeDom} from '../render/node.ts';
import {InsertPoint} from '../types.ts';
import {checkClassChild} from '../utils/check-parent.ts';

type HNodeDom = HNodeElement | HNodeText;

const getDomNode = (hNode: HNodeDom): ChildNode => {
  if (checkClassChild(hNode, 'hNodeText')) {
    return hNode.textNode;
  }
  return (hNode as HNodeElement).element;
};

// компонентные узлы не несут DOM, поэтому для сравнения позиций
// обе стороны раскладываются в плоский список
const flatRenderNodes = (
  renderNodes: RenderNode[],
  store: RenderNodeDom[] = []
): RenderNodeDom[] => {
  for (const renderNode of renderNodes) {
    if (renderNode.type === 'component') {
      flatRenderNodes(renderNode.children, store);
      continue;
    }

    store.push(renderNode);
  }

  return store;
};

const flatHNodes = (hNodes: HNode[], store: HNodeDom[] = []): HNodeDom[] => {
  for (const hNode of hNodes) {
    if (checkClassChild(hNode, 'hNodeComponent')) {
      flatHNodes(hNode.children, store);
      continue;
    }

    store.push(hNode as HNodeDom);
  }

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

const insert = (node: ChildNode, insertPoint: InsertPoint) => {
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
    insert(domNode, insertPoint);

    return {hNode: createHNode(renderNode, domNode), oldChildren: []};
  }

  if (checkReplace(renderNode, hNode)) {
    if (checkClassChild(hNode, 'hNodeElement')) {
      hNode.listenerManager.cleanup();
    }

    const domNode = createDomNode(renderNode, window);
    getDomNode(hNode).replaceWith(domNode);

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

const removeNode = (hNode: HNodeDom) => {
  if (checkClassChild(hNode, 'hNodeElement')) {
    hNode.listenerManager.cleanup();
  }

  getDomNode(hNode).remove();
};

// собирает дерево узлов: компонентные создаёт на месте,
// несущие DOM берёт из уже применённых, в том же порядке обхода
const buildHNodes = (
  renderNodes: RenderNode[],
  applied: HNodeDom[],
  cursor: {index: number},
  parent?: HNode
): HNode[] => {
  return renderNodes.map((renderNode) => {
    if (renderNode.type === 'component') {
      const hNode = new HNodeComponent({
        globalCtx: renderNode.globalCtx,
        segmentEnt: renderNode.segmentEnt,
        mounts: renderNode.mounts,
        unmounts: renderNode.unmounts,
      });
      renderNode.segmentEnt.hNode = hNode;
      hNode.parent = parent;
      hNode.children = buildHNodes(
        renderNode.children,
        applied,
        cursor,
        hNode
      );

      return hNode;
    }

    const hNode = applied[cursor.index];
    cursor.index++;
    hNode.parent = parent;

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
  const newFlat = flatRenderNodes(renderNodes);
  const oldFlat = flatHNodes(oldHNodes);

  const applied: HNodeDom[] = [];
  let prevNode = insertPoint.prevNode;

  const max = Math.max(newFlat.length, oldFlat.length);

  for (let i = 0; i < max; i++) {
    const renderNode = newFlat[i];
    const oldHNode = oldFlat[i];

    if (!renderNode) {
      removeNode(oldHNode);
      continue;
    }

    const {hNode, oldChildren} = handleNode({
      renderNode,
      hNode: oldHNode,
      window,
      insertPoint: {parent: insertPoint.parent, prevNode},
    });

    applied.push(hNode);
    prevNode = getDomNode(hNode);

    if (renderNode.type === 'element') {
      const children = applyRenderNodes({
        renderNodes: renderNode.children,
        oldHNodes: oldChildren,
        insertPoint: {parent: (hNode as HNodeElement).element},
        window,
        parent: hNode,
      });

      hNode.children = children;
    }
  }

  return buildHNodes(renderNodes, applied, {index: 0}, parent);
};
