import {
  VNewElement,
  VOldElement,
  VNewText,
  VOldText,
  VNew,
  VOld,
} from './types.ts';
import {convertFromNewToOld} from './v.ts';

const getDomNode = (vOld: VOld) => {
  if (vOld.type === 'text') {
    return vOld.textNode;
  }
  return vOld.element;
};

export const deleteFunc = (vOld: VOld) => {
  getDomNode(vOld).remove();
};

export const createTextSimple = (text: string, window: Window) => {
  const textNode = window.document.createTextNode(text);

  return textNode;
};

export const createText = (vNew: VNewText, window: Window) => {
  return createTextSimple(vNew.data.text, window);
};

export const createElement = (vNew: VNewElement, window: Window) => {
  const element = window.document.createElement(vNew.data.tag);

  for (const key in vNew.data.props) {
    const value = vNew.data.props[key];
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
  getDomNode(vOld).replaceWith(newDomNode);

  return newDomNode;
};

const splitProps = (vNew: VNewElement, vOld: VOldElement) => {
  const newProps: Record<string, any> = {};

  for (const key in vNew.data.props) {
    const newValue = vNew.data.props[key];
    const oldValue = vOld.data.props[key];

    if (newValue === oldValue) {
      continue;
    }

    newProps[key] = newValue;
  }

  const oldProps: Record<string, any> = {};

  for (const key in vOld.data.props) {
    if (key in vNew) {
      continue;
    }
    const oldValue = vOld.data.props[key];

    oldProps[key] = oldValue;
  }

  return {
    newProps,
    oldProps,
  };
};

const patchElement = (vNew: VNewElement, vOld: VOldElement) => {
  const {newProps, oldProps} = splitProps(vNew, vOld);
  const element = vOld.element;

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
      const oldValue = vOld.data.props[key];
      if (typeof oldValue === 'function') {
        element.removeEventListener(key, oldValue);
      }
      element.addEventListener(key, newValue);
    } else {
      element.setAttribute(key, newValue);
    }
  }
  return vOld.element;
};

export const handle = (
  vNew: VNew | undefined,
  vOld: VOld | undefined,
  window: Window,
  parentElement: Element
) => {
  if (!vNew) {
    deleteFunc(vOld!);
    return;
  }

  if (!vOld) {
    const newDomNode = create(vNew, window);
    parentElement.appendChild(newDomNode);

    convertFromNewToOld(vNew, newDomNode);
    return;
  }

  // now we sure that vNew and vOld have one type
  if (vOld.type !== vNew.type) {
    const newNode = replaceFull(vNew, vOld, window);

    convertFromNewToOld(vNew, newNode);
    return;
  }

  if (vOld.type === 'text') {
    if (vOld.data.text !== (vNew as VNewText).data.text) {
      const vNewText = vNew as VNewText;
      const vOldText = vOld as VOldText;

      vOldText.textNode.textContent = vNewText.data.text;

      convertFromNewToOld(vNew, vOldText.textNode);
      return;
    } else {
      convertFromNewToOld(vNew, vOld.textNode);
      return;
    }
  }
  const vNewSure = vNew as VNewElement;
  const vOldSure = vOld as VOldElement;
  if (vOldSure.data.tag !== vNewSure.data.tag) {
    const node = replaceFull(vNewSure, vOldSure, window);
    convertFromNewToOld(vNew, node);
  }

  // now we sure that vNew and vOld have one type and should be replaced by properties
  patchElement(vNewSure, vOldSure);
  convertFromNewToOld(vNewSure, vOldSure.element);
};