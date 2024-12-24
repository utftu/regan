import {HNode} from '../h-node/h-node.ts';
import {handleEdgeTextCases} from './edge.ts';
import {
  createElement,
  createText,
  deleteFunc,
  getDomNode as getNode,
  handle,
} from './handle.ts';
import {handleKey, KeyStoreNew, KeyStoreOld} from './key.ts';
import {
  VNewElement,
  VOldElement,
  VNewText,
  VNew,
  VOld,
  VOldText,
} from './types.ts';

export const insertChild = ({
  parent,
  prevVNew,
  node: node,
  vOld,
}: {
  parent: ParentNode;
  prevVNew: VOld | void;
  node: Node;
  vOld: VOld | void;
}) => {
  if (prevVNew) {
    const prevDomNode = getNode(prevVNew);
    prevDomNode.after(node);
    return;
  }

  if (vOld) {
    const vOldDomNode = getNode(vOld);
    vOldDomNode.after(node);
    return;
  }

  parent.appendChild(node);
};

export const setSkip = (vNew: VNew | VOld) => {
  vNew.skip = true;
};
export const deleteSkip = (v: VNew | VOld | void) => {
  if (!v) {
    return;
  }
  delete v.skip;
};
export const checkSkip = (vNew: VNew | void) => {
  if (!vNew) {
    return false;
  }
  if ('skip' in vNew) {
    return true;
  }
  return false;
};

export const convertTextNewToOld = (vNew: VNewText, textNode: Text) => {
  const vOld = vNew as VOldText;

  vOld.textNode = textNode;
  vOld.init?.(vOld);
};

export const convertElementNewToOld = (vNew: VNewElement, element: Element) => {
  const vOld = vNew as VOldElement;

  vOld.element = element;
  vOld.init?.(vOld);
};

export const convertFromNewToOld = (vNew: VNew, domNode: Node) => {
  if (vNew.type === 'text') {
    convertTextNewToOld(vNew, domNode as Text);
    return vNew;
  } else if (vNew.type === 'element') {
    convertElementNewToOld(vNew, domNode as Element);
  }
};

export const virtualApplyExternal = ({
  vNews,
  vOlds,
  hNode,
  parent,
  window,
  keyStoreNew = {},
  keyStoreOld = {},
}: {
  vNews: VNew[];
  vOlds: VOld[];
  hNode: HNode;
  parent: ParentNode;
  window: Window;
  keyStoreOld?: KeyStoreOld;
  keyStoreNew?: KeyStoreNew;
}) => {
  const actions = handleEdgeTextCases(vNews, vOlds, hNode, window);
  actions.forEach((action) => action());

  // not use virtualApplyInternalSimple, because it relys that parent is a element
  virtualApplyInternal({
    vNews,
    vOlds,
    window,
    parent,
    keyStoreNew,
    keyStoreOld,
  });
};

export const virtualApplyInternalSimple = ({
  vNew,
  vOld,
  parent,
  window,
}: {
  vNew?: VNew;
  vOld?: VOld;
  parent: ParentNode;
  window: Window;
}) => {
  const vNewIsElement = vNew?.type === 'element';
  const vOldIsElement = vOld?.type === 'element';
  const newParent = vNewIsElement ? (vNew as VOldElement).element : parent;
  const keyStoreNewMy = vNewIsElement ? vNew.keyStore : {};
  const keyStoreOldMy = vOldIsElement ? vOld.keyStore : {};

  virtualApplyInternal({
    vNews: vNewIsElement ? vNew.children : [],
    vOlds: vOldIsElement ? vOld.children : [],
    parent: newParent,
    window,
    keyStoreNew: keyStoreNewMy,
    keyStoreOld: keyStoreOldMy,
  });
};

export const virtualApplyInternal = ({
  vNews,
  vOlds,
  window,
  parent,
  keyStoreNew,
  keyStoreOld,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  parent: ParentNode;
  keyStoreOld: KeyStoreOld;
  keyStoreNew: KeyStoreNew;
}) => {
  for (let i = 0; i < Math.max(vNews.length, vOlds.length); i++) {
    const prevVNew = vNews[i - 1] as VOld | undefined;
    const vNew = vNews[i] as VNew | undefined;
    const vOld = vOlds[i] as VOld | undefined;

    if (vNew && !checkSkip(vNew)) {
      handleKey({vNew, window, keyStoreNew, keyStoreOld});
    }

    if (checkSkip(vOld) && checkSkip(vNew)) {
      deleteSkip(vNew);
      deleteSkip(vOld);
      continue;
    }

    if (checkSkip(vOld)) {
      deleteSkip(vOld);
      if (!vNew) {
        continue;
      }
      if (vNew.type === 'text') {
        const textNode = createText(vNew, window);

        insertChild({parent: parent, prevVNew, node: textNode, vOld});
        convertTextNewToOld(vNew, textNode);
      } else {
        const element = createElement(vNew, window);

        insertChild({parent, prevVNew, node: element, vOld});

        // to not notify too early
        (vNew as VOldElement).element = element;

        virtualApplyInternalSimple({
          vNew,
          vOld: undefined,
          parent,
          window,
        });
        convertElementNewToOld(vNew, element);
      }

      continue;
    }

    if (checkSkip(vNew)) {
      deleteSkip(vNew);
      if (vOld) {
        deleteFunc(vOld);
      }
      continue;
    }

    handle({
      vNew: vNews[i],
      vOld: vOlds[i],
      window,
      parent: parent,
      prevVNew,
    });

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      virtualApplyInternalSimple({
        vNew,
        vOld,
        parent,
        window,
      });
    }
  }
};
