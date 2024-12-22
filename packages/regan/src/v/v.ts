import {HNode} from '../h-node/h-node.ts';
import {handleEdgeTextCases} from './edge.ts';
import {
  createElement,
  createText,
  deleteFunc,
  getDomNode as getNode,
  handle,
} from './handle.ts';
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

// const a: ParentNode = document.createElement('div');

let count = 0;

export const virtualApplyExternal = (
  vNews: VNew[],
  vOlds: VOld[],
  hNode: HNode,
  parentNode: ParentNode,
  window: Window
) => {
  count++;
  console.log('-----', 'before edge', (parentNode as Element).innerHTML);

  const actions = handleEdgeTextCases(vNews, vOlds, hNode, window);
  actions.forEach((action) => action());

  console.log('-----', 'before iterate', (parentNode as Element).innerHTML);

  for (let i = 0; i < Math.max(vNews.length, vOlds.length); i++) {
    const prevVNew = vNews[i - 1] as VOld | undefined;
    const vNew = vNews[i] as VNew | undefined;
    const vOld = vOlds[i] as VOld | undefined;

    if (count === 2) {
      console.log('-----', 'vNew', vNew);
    }

    if (checkSkip(vOld) && checkSkip(vNew)) {
      console.log('-----', 'here');
      continue;
    }

    if (checkSkip(vOld)) {
      console.log('-----', 'here2');
      if (!vNew) {
        continue;
      }
      if (vNew.type === 'text') {
        const textNode = createText(vNew, window);
        convertTextNewToOld(vNew, textNode);

        insertChild({parent: parentNode, prevVNew, node: textNode, vOld});
        // parentNode.appendChild(textNode);
      } else {
        const element = createElement(vNew, window);
        convertElementNewToOld(vNew, element);

        insertChild({parent: parentNode, prevVNew, node: element, vOld});
        // parentNode.appendChild(element);
      }

      deleteSkip(vOld);

      console.log('-----', '>>>', (parentNode as Element).innerHTML);

      continue;
    }

    if (checkSkip(vNew)) {
      if (vOld) {
        deleteFunc(vOld);
      }
      deleteSkip(vNew);
      continue;
    }

    if (count === 2) {
      console.log('-----', 'before handle');
    }
    handle({vNew, vOld, window, parent: parentNode, prevVNew});

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      virtualApplyInternal({
        vNews: vNew?.type === 'element' ? vNew.children : [],
        vOlds: vOld?.type === 'element' ? vOld.children : [],
        parentNode:
          vNew?.type === 'element' ? (vNew as VOldElement).element : parentNode,
        window,
      });
    }
  }
};

const virtualApplyInternal = ({
  vNews,
  vOlds,
  window,
  parentNode,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  parentNode: ParentNode;
}) => {
  for (let i = 0; i < Math.max(vNews.length, vOlds.length); i++) {
    const prevVNew = vNews[i - 1] as VOld | undefined;
    const vNew = vNews[i] as VNew | undefined;
    const vOld = vOlds[i] as VOld | undefined;

    handle({
      vNew: vNews[i],
      vOld: vOlds[i],
      window,
      parent: parentNode,
      prevVNew,
    });

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      virtualApplyInternal({
        vNews: vNew?.type === 'element' ? vNew.children : [],
        vOlds: vOld?.type === 'element' ? vOld.children : [],
        parentNode:
          vNew?.type === 'element' ? (vNew as VOldElement).element : parentNode,
        window,
      });
    }
  }
};
