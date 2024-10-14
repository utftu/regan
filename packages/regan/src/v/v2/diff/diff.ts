// import {Atom} from 'strangelove';
import {
  VNewElement,
  VOldElement,
  VNewText,
  VOldText,
  VNew,
  VOld,
} from '../v.ts';

// export type EventDiffPatchElement = {
//   element: Node;
//   type: 'patchElement';
//   newProps: Record<string, any>;
//   oldProps: Record<string, any>;
// };

// export type EventDiff =
//   | {type: 'delete'}
//   | {type: 'create'}
//   | {type: 'replaceFull'}
//   | {type: 'nextText'}
//   | {type: 'replaceText'}
//   | EventDiffPatchElement;

export type EventDiff =
  | {type: 'delete'; node: null}
  | {type: 'create'; node: Node}
  | {type: 'replaceFull'; node: Node}
  | {type: 'replaceText'; node: Text}
  | {type: 'nextText'; node: Text}
  | {type: 'patchElement'; node: Element};
// | EventDiffPatchElement;

const deleteFunc = (vOld: VOld) => {
  vOld.node.parentNode!.removeChild(vOld.node);
};

const create = (vNew: VNew, window: Window) => {
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

const replaceFull = (vNew: VNew, vOld: VOld, window: Window) => {
  const newDomNode = create(vNew, window);
  vOld.node.replaceWith(newDomNode);
  // vOld!.node.parentElement!.replaceChild(newDomNode, vOld.node);
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

      const oldTextContext = vOld!.node.textContent!;
      vOldText.node.textContent = `${oldTextContext.slice(0, vOldText.start)}${
        vNewText.text
      }${oldTextContext.slice(vOldText.start)}`;

      return {
        node: vOldText.node,
        type: 'replaceText',
      };
    } else {
      return {
        node: vOld.node!,
        type: 'nextText',
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

// export const diffOne = (vNew?: VNew, vOld?: VOld): EventDiff => {
//   if (!vNew) {
//     return {
//       type: 'delete',
//     } as const;
//   }

//   if (!vOld) {
//     return {
//       type: 'create',
//     };
//   }

//   if (vOld.type !== vNew.type) {
//     return {
//       type: 'replaceFull',
//     };
//   }

//   if (vOld.type === 'text') {
//     if (vOld.text === (vNew as TextVNew).text) {
//       return {
//         type: 'nextText',
//       };
//     } else {
//       return {
//         type: 'replaceText',
//       };
//     }
//   }

//   const vNewSure = vNew as ElementVNew;
//   if (vOld.tag !== vNewSure.tag) {
//     return {
//       type: 'replaceFull',
//     };
//   }

//   const newProps: Record<string, any> = {};

//   for (const key in vNewSure.props) {
//     const newValue = vNewSure.props[key];
//     const oldValue = vOld.props[key];

//     const realNewValue = newValue instanceof Atom ? newValue.get() : newValue;
//     const realOldValue = oldValue instanceof Atom ? oldValue.get() : oldValue;

//     if (realNewValue === realOldValue) {
//       continue;
//     }

//     newProps[key] = realNewValue;
//   }

//   const oldProps: Record<string, any> = {};

//   for (const key in vOld.props) {
//     if (key in vNewSure) {
//       continue;
//     }
//     const oldValue = vOld.props[key];
//     const realOldValue = oldValue instanceof Atom ? oldValue.get() : oldValue;

//     oldProps[key] = realOldValue;
//   }

//   return {
//     element: vOld.node,
//     newProps,
//     oldProps,
//     type: 'patchElement',
//   };
// };
