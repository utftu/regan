import {HNodeText} from '../h-node/text.ts';
import {detachDynamicProps} from '../utils/props/props.ts';
import {EventDiff} from './diff.ts';
import {VElementNew, VNew, VTextNew} from './new.ts';
import {VElementOld, VOld, VTextOld} from './old.ts';

const createDomNode = (vNew: VNew, window: Window) => {
  if (vNew.type === 'text') {
    const textNode = window.document.createTextNode(vNew.text);

    return textNode;
  }

  const el = window.document.createElement(vNew.tag);

  for (const key in vNew.props) {
    const value = vNew.props[key];
    if (typeof value === 'function') {
      el.setAttribute(key, value);
    }
  }

  return el;
};

const apply = ({
  parentEl,
  event,
  vOld,
  vNew,
  window,
}: {
  parentEl: Element;
  event: EventDiff;
  vOld: VOld;
  vNew: VNew;
  window: Window;
}) => {
  if (event.type === 'delete') {
    vOld.domNode.parentNode!.removeChild(vOld.domNode);
    return;
  }

  if (event.type === 'create') {
    const newDomNode = createDomNode(vNew, window);
    parentEl.appendChild(newDomNode);
    return;
  }

  if (event.type === 'replaceFull') {
    const newDomNode = createDomNode(vNew, window);
    vOld.domNode.parentNode!.replaceChild(vOld.domNode, newDomNode);
    return;
  }

  if (event.type === 'nextText') {
    return;
  }

  if (event.type === 'replaceText') {
    const vNewText = vNew as VTextNew;
    const vOldText = vOld as VTextOld;

    const textContext = vOld.domNode.textContent!;
    vOld.domNode.textContent = `${textContext.slice(0, vOldText.start)}${
      vNewText.text
    }${textContext.slice(vOldText.start)}`;
    return;
  }

  if (event.type === 'childrenEl') {
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
      const value = event.newProps[key];

      if (typeof value === 'function') {
        const oldValue = vOldSure.props[key];
        if (typeof oldValue === 'function') {
          element.removeEventListener(key, oldValue);
        }
        element.addEventListener(key, value);
      } else {
        element.setAttribute(key, value);
      }
    }
  }
};
