// import {Atom} from 'strangelove';
import {HNode} from '../../h-node/h-node.ts';
import {
  findNextTextNode,
  findPrevTextNode,
} from '../../h-node/helpers/find-text.ts';
import {
  VNewElement,
  VOldElement,
  VNewText,
  VOldText,
  VNew,
  VOld,
} from '../types.ts';

export type EventDiff =
  | {type: 'delete'; node: null}
  | {type: 'create'; node: Text | Element}
  | {type: 'replaceFull'; node: Text | Element}
  | {type: 'replaceText'; node: Text}
  | {type: 'omitTextReplace'; node: Text}
  | {type: 'patchElement'; node: Element};

const deleteFunc = (vOld: VOld) => {
  vOld.node.parentNode!.removeChild(vOld.node);
};

const createTextSimple = (text: string, window: Window) => {
  const textNode = window.document.createTextNode(text);

  return textNode;
};

const createText = (vNew: VNewText, window: Window) => {
  return createTextSimple(vNew.text, window);
};

const createElement = (vNew: VNewElement, window: Window) => {
  const element = window.document.createElement(vNew.tag);

  for (const key in vNew.props) {
    const value = vNew.props[key];
    if (typeof value === 'function') {
      element.addEventListener(key, value);
    } else {
      element.setAttribute(key, value);
    }
  }

  return element;
};

const create = (vNew: VNew, window: Window) => {
  if (vNew.type === 'text') {
    return createText(vNew, window);
  }

  return createElement(vNew, window);
};

const replaceFull = (vNew: VNew, vOld: VOld, window: Window) => {
  const newDomNode = create(vNew, window);
  vOld.node.replaceWith(newDomNode);
  return newDomNode;
};

const splitProps = (vNew: VNewElement, vOld: VOldElement) => {
  const newProps: Record<string, any> = {};

  for (const key in vNew.props) {
    const newValue = vNew.props[key];
    const oldValue = vOld.props[key];

    if (newValue === oldValue) {
      continue;
    }

    newProps[key] = newValue;
  }

  const oldProps: Record<string, any> = {};

  for (const key in vOld.props) {
    if (key in vNew) {
      continue;
    }
    const oldValue = vOld.props[key];

    oldProps[key] = oldValue;
  }

  return {
    newProps,
    oldProps,
  };
};

const patchElement = (vNew: VNewElement, vOld: VOldElement) => {
  const {newProps, oldProps} = splitProps(vNew, vOld);
  const element = vOld.node;

  for (const key in oldProps) {
    const value = oldProps[key];

    if (typeof value === 'function') {
      element.removeEventListener(key, value);
    } else {
      element.removeAttribute(key);
    }
  }
  for (const key in newProps) {
    const newValue = newProps[key];

    if (typeof newValue === 'function') {
      const oldValue = vOld.props[key];
      if (typeof oldValue === 'function') {
        element.removeEventListener(key, oldValue);
      }
      element.addEventListener(key, newValue);
    } else {
      element.setAttribute(key, newValue);
    }
  }
  return vOld.node;
};

const vOldStart = 5; // todo

const findNextTextNodes = (hNode: HNode) => {
  const nodes = [];
  let nextNode = findNextTextNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findNextTextNode(nextNode);
  }
  return nodes;
};

const bam = (
  vNew: VNew,
  vOld: VOld,
  hNode: HNode,
  position: ('before' | 'after')[]
) => {
  if (vNew.type === 'text' && vOld.type === 'text') {
    // vOld.node
    // const prevTextHNode = findPrevTextNode(hNode);
    // if (!prevTextHNode) {
    //   return;
    // }
  }

  if (vNew.type === 'text' && vOld.type === 'element') {
    if (position.includes('before')) {
      const prevTextHNode = findPrevTextNode(hNode);

      if (prevTextHNode) {
        const startPosition = prevTextHNode.start + prevTextHNode.text.length;
        const prevTextPart = prevTextHNode.domNode.textContent!.slice(
          0,
          startPosition
        );
        const nextTextPart = prevTextHNode.domNode.textContent!.slice(
          startPosition + vNew.text.length
        );
        prevTextHNode.domNode.textContent = `${prevTextPart}${vNew.text}${nextTextPart}`;
      }
    }

    if (position.includes('after')) {
      const nextTextHNodes = findNextTextNodes(hNode);
      if (nextTextHNodes.length > 0) {
        const firstNextTextNode = nextTextHNodes[0];
      }
    }

    const domNode = prevTextHNode.domNode;

    domNode.textContent += vNew.text;

    return domNode;
  }

  if (vNew.type === 'element' && vOld.type === 'text') {
    // const element = createElement(vNew, window);

    // const needDeleteNode = vOld.node.textContent!.length !== vOld.text.length;
    let needDeleteNode = true;

    if (position.includes('before')) {
      const prevTextHNode = findPrevTextNode(hNode);

      if (prevTextHNode) {
        prevTextHNode.domNode.textContent =
          prevTextHNode.domNode.textContent?.slice(0, vOldStart) as any;
        needDeleteNode = false;
      }
    }

    if (position.includes('after')) {
      const nextTextHNodes = findNextTextNodes(hNode);
      if (nextTextHNodes.length > 0) {
        const firstNextTextNode = nextTextHNodes[0];
        const textNode = createTextSimple(
          firstNextTextNode.domNode.textContent!.slice(firstNextTextNode.start),
          window
        );

        nextTextHNodes.forEach((hNodeText) => {
          hNodeText.start -= firstNextTextNode.start;
          hNodeText.domNode = textNode;
        });
      }
    }

    const element = createElement(vNew, window);

    if (needDeleteNode) {
      vOld.node.replaceWith(element);
    } else {
      vOld.node.after(element);
    }
  }
};

export const handle = (
  vNew: VNew | undefined,
  vOld: VOld | undefined,
  window: Window,
  parentElement: Element
): EventDiff => {
  if (!vNew) {
    deleteFunc(vOld!);
    return {
      node: null,
      type: 'delete',
    };
  }

  if (!vOld) {
    const newDomNode = create(vNew, window);
    parentElement.appendChild(newDomNode);
    return {
      node: newDomNode,
      type: 'create',
    };
  }

  // now we sure that vNew and vOld have one type
  if (vOld.type !== vNew.type) {
    const newNode = replaceFull(vNew, vOld, window);
    return {
      node: newNode,
      type: 'replaceFull',
    };
  }

  if (vOld.type === 'text') {
    if (vOld.text !== (vNew as VNewText).text) {
      const vNewText = vNew as VNewText;
      const vOldText = vOld as VOldText;

      vOldText.node.textContent = vNewText.text;

      // const oldTextContext = vOld!.node.textContent!;
      // vOldText.node.textContent = `${oldTextContext.slice(0, vOldText.start)}${
      //   vNewText.text
      // }${oldTextContext.slice(vOldText.start)}`;

      return {
        node: vOldText.node,
        type: 'replaceText',
      };
    } else {
      return {
        node: vOld.node!,
        type: 'omitTextReplace',
      };
    }
  }
  const vNewSure = vNew as VNewElement;
  const vOldSure = vOld as VOldElement;
  if (vOldSure.tag !== vNewSure.tag) {
    const node = replaceFull(vNewSure, vOldSure, window);
    return {
      node,
      type: 'replaceFull',
    };
  }

  // now we sure that vNew and vOld have one type and should be replaced by properties
  patchElement(vNewSure, vOldSure);
  return {
    node: vOld.node,
    type: 'patchElement',
  };
};
