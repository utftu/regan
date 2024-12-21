import {HNode} from '../h-node/h-node.ts';
import {handleEdgeTextCases} from './edge.ts';
import {createElement, createText, deleteFunc, handle} from './handle.ts';
import {
  VNewElement,
  VOldElement,
  VNewText,
  VNew,
  VOld,
  VOldText,
} from './types.ts';

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

export const virtualApplyExternal = (
  vNews: VNew[],
  vOlds: VOld[],
  hNode: HNode,
  parentElement: Element,
  window: Window
) => {
  const actions = handleEdgeTextCases(vNews, vOlds, hNode, window);
  actions.forEach((action) => action());

  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew: VNew | undefined = vNews[i];
    const vOld: VOld | undefined = vOlds[i];

    if (vOld.meta.skip && vNew.meta.skip) {
      continue;
    }

    if (vOld.meta.skip) {
      if (vNew.type === 'text') {
        const textNode = createText(vNew, window);
        convertTextNewToOld(vNew, textNode);
        parentElement.appendChild(textNode);
      } else {
        const element = createElement(vNew, window);
        convertElementNewToOld(vNew, element);
        parentElement.appendChild(element);
      }

      vOld.meta.skip = false;
      continue;
    }

    if (vNew.meta.skip) {
      deleteFunc(vOld);
      vNew.meta.skip = false;
      continue;
    }

    handle(vNew, vOld, window, parentElement);

    if (vNew.type === 'element' || vOld.type === 'element') {
      virtualApplyInternal({
        vNews: vNew.type === 'element' ? vNew.children : [],
        vOlds: vOld.type === 'element' ? vOld.children : [],
        parentElement:
          vNew.type === 'element'
            ? (vNew as VOldElement).element
            : parentElement,
        window,
      });
    }
  }
};

const virtualApplyInternal = ({
  vNews,
  vOlds,
  window,
  parentElement,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  parentElement: Element;
}) => {
  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew: VNew | undefined = vNews[i];
    const vOld: VOld | undefined = vOlds[i];

    handle(vNews[i], vOlds[i], window, parentElement);

    if (vNew.type === 'element' || vOld.type === 'element') {
      virtualApplyInternal({
        vNews: vNew.type === 'element' ? vNew.children : [],
        vOlds: vOld.type === 'element' ? vOld.children : [],
        parentElement:
          vNew.type === 'element'
            ? (vNew as VOldElement).element
            : parentElement,
        window,
      });
    }
  }
};
