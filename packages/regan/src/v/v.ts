import {HNode} from '../h-node/h-node.ts';
import {DomPointer} from '../types.ts';
import {convertElementNewToOld, convertTextNewToOld} from './convert.ts';
import {handleEdgeTextCases} from './edge.ts';
import {createElement, createText, deleteFunc, handle} from './handle.ts';
import {insertChild} from './insert.ts';
import {handleKey, KeyStoreNew, KeyStoreOld} from './key.ts';
import {checkSkip, deleteSkip} from './skip.ts';
import {VOldElement, VNew, VOld} from './types.ts';

export const virtualApplyExternal = ({
  vNews,
  vOlds,
  hNode,
  domPointer,
  window,
  keyStoreNew = {},
  keyStoreOld = {},
}: {
  vNews: VNew[];
  vOlds: VOld[];
  hNode?: HNode;
  domPointer: DomPointer;
  window: Window;
  keyStoreOld?: KeyStoreOld;
  keyStoreNew?: KeyStoreNew;
}) => {
  if (hNode) {
    const actions = handleEdgeTextCases(vNews, vOlds, hNode, window);
    actions.forEach((action) => action());
  }

  // not use virtualApplyInternalSimple, because it relys that parent is a element
  virtualApplyInternal({
    vNews,
    vOlds,
    window,
    domPointer,
    keyStoreNew,
    keyStoreOld,
  });
};

export const virtualApplyInternalSimple = ({
  vNew,
  vOld,
  window,
  domPointer,
}: {
  vNew?: VNew;
  vOld?: VOld;
  domPointer: DomPointer;
  window: Window;
}) => {
  const vNewIsElement = vNew?.type === 'element';
  const vOldIsElement = vOld?.type === 'element';
  const keyStoreNewMy = vNewIsElement ? vNew.keyStore : {};
  const keyStoreOldMy = vOldIsElement ? vOld.keyStore : {};
  const realDomPointer: DomPointer = vNewIsElement
    ? {parent: (vNew as VOldElement).element, nodeCount: 0}
    : domPointer;

  virtualApplyInternal({
    vNews: vNewIsElement ? vNew.children : [],
    vOlds: vOldIsElement ? vOld.children : [],
    domPointer: realDomPointer,
    window,
    keyStoreNew: keyStoreNewMy,
    keyStoreOld: keyStoreOldMy,
  });
};

export const virtualApplyInternal = ({
  vNews,
  vOlds,
  window,
  keyStoreNew,
  keyStoreOld,
  domPointer,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  window: Window;
  domPointer: DomPointer;
  keyStoreOld: KeyStoreOld;
  keyStoreNew: KeyStoreNew;
}) => {
  for (let i = 0; i < Math.max(vNews.length, vOlds.length); i++) {
    const prevVNew = vNews[i - 1] as VOld | undefined;
    const vNew = vNews[i] as VNew | undefined;
    const vOld = vOlds[i] as VOld | undefined;

    if (vNew && !checkSkip(vNew)) {
      handleKey({
        parentDomPointer: domPointer,
        vNew,
        window,
        keyStoreNew,
        keyStoreOld,
      });
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

        insertChild({domPointer, prevVNew, node: textNode});
        convertTextNewToOld(vNew, textNode);
      } else {
        const element = createElement(vNew, window);

        insertChild({domPointer, prevVNew, node: element});

        // to not notify too early
        (vNew as VOldElement).element = element;

        virtualApplyInternalSimple({
          vNew,
          vOld: undefined,
          domPointer,
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
      domPointer,
      prevVNew,
    });

    if (vNew?.type === 'element' || vOld?.type === 'element') {
      virtualApplyInternalSimple({
        vNew,
        vOld,
        domPointer,
        window,
      });
    }
  }
};
