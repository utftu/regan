import {EventDiff} from '../diff/diff.ts';
import {Control, VNewElement, VOldElement} from '../v.ts';

const createDomNode = (vNew: VNewElement, window: Window) => {
  if (vNew.type === 'text') {
    const textNode = window.document.createTextNode(vNew.text);

    return textNode;
  }

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

export const apply = ({
  event,
  vOld,
  vNew,
  window,
  control,
}: {
  event: EventDiff;
  vOld?: VOldElement;
  vNew?: VNewElement;
  window: Window;
  control: Control;
}) => {
  if (event.type === 'delete') {
    const vOldSure = vOld as VOldElement;
    vOldSure.node.parentNode!.removeChild(vOldSure.node);
    if (vOldSure.type === 'element') {
      vOldSure.node.parentNode!.removeChild(vOldSure.node);
    } else {
      vOldSure.node.parentNode!.removeChild(vOldSure.node);
    }

    return;
  }

  if (event.type === 'create') {
    const newDomNode = createDomNode(vNew!, window);

    control.addNode(newDomNode);
    return newDomNode;
  }

  if (event.type === 'replaceFull') {
    const newDomNode = createDomNode(vNew!, window);
    vOld!.node.parentElement!.replaceChild(newDomNode, vOld!.node);
    return newDomNode;
  }

  if (event.type === 'nextText') {
    return;
  }

  if (event.type === 'replaceText') {
    const vNewText = vNew as VTextNew;
    const vOldText = vOld as VTextOld;

    const textContext = vOld!.domNode.textContent!;
    vOld!.domNode.textContent = `${textContext.slice(0, vOldText.start)}${
      vNewText.text
    }${textContext.slice(vOldText.start)}`;
    return vOld!.domNode;
  }

  if (event.type === 'patchElement') {
    const vOldSure = vOld as VElementOld;
    const vNewSure = vOld as VElementNew;
    const element = vOldSure.domNode;
    // detachDynamicProps(vOldSure.dynamicProps);
    vNewSure.init?.(element);

    for (const key in event.oldProps) {
      const value = event.oldProps[key];

      if (typeof value === 'function') {
        element.removeEventListener(key, value);
      } else {
        element.removeAttribute(key);
      }
    }
    for (const key in event.newProps) {
      const newValue = event.newProps[key];

      if (typeof newValue === 'function') {
        const oldValue = vOldSure.props[key];
        if (typeof oldValue === 'function') {
          element.removeEventListener(key, oldValue);
        }
        element.addEventListener(key, newValue);
      } else {
        element.setAttribute(key, newValue);
      }
    }
    return vOldSure.domNode;
  }
};
