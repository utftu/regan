import {HNode} from '../h-node/h-node.ts';
import {findNextTextNode} from '../h-node/helpers/find-text.ts';
import {HNodeText} from '../h-node/text.ts';
import {createTextSimple} from './handle/handle.ts';
import {VNew, VNewText, VOld} from './types.ts';

const findNextTextNodes = (hNode: HNode) => {
  const nodes = [];
  let nextNode = findNextTextNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findNextTextNode(nextNode);
  }
  return nodes;
};

const removeJoinedText = ({
  oldText,
  prevHNode,
  nextHNodes,
}: {
  oldText: string;
  prevHNode?: HNodeText;
  nextHNodes: HNodeText[];
}) => {
  const nextHNode = nextHNodes[0];
  if (!prevHNode || !nextHNode) {
    return;
  }

  const newText = prevHNode.text + oldText + nextHNodes[0].text;

  prevHNode.domNode.textContent = newText;

  nextHNodes.forEach((hNode) => {
    hNode.domNode.remove();
  });
};

const join = ({
  text,
  window,
  nextHNodes,
  prevHNode,
}: {
  text: string;
  window: Window;
  nextHNodes: HNodeText[];
  prevHNode?: HNodeText;
}) => {
  const nextHNode = nextHNodes[0];
  if (!prevHNode || !nextHNode) {
    return;
  }

  const newText =
    prevHNode.domNode.textContent! + text + nextHNode.domNode.textContent!;

  prevHNode.domNode.textContent = newText;

  nextHNodes.forEach((hNode) => {
    hNode.domNode.remove();
  });
};

const split = (
  window: Window,
  nextHNodes: HNodeText[],
  prevHNode?: HNodeText
) => {
  const nextHNode = nextHNodes[0];
  if (!prevHNode || !nextHNode) {
    return;
  }

  const splitIndex = prevHNode.start + prevHNode.text.length;

  const newNextTextNode = createTextSimple(
    prevHNode.text.slice(splitIndex),
    window
  );

  prevHNode.domNode.textContent = prevHNode.text.slice(0, splitIndex);
  prevHNode.domNode.after(newNextTextNode);

  nextHNodes.forEach((hNode) => {
    hNode.domNode = newNextTextNode;
    hNode.start -= splitIndex;
    if (hNode.vOldText) {
      hNode.vOldText.node = newNextTextNode;
    }
  });
};

const deletePrevText = (hNode: HNodeText, oldText: string) => {
  hNode.domNode.textContent = hNode.domNode.textContent!.slice(
    0,
    -oldText.length
  );
};

const addPrevText = (hNode: HNodeText, newText: string) => {
  hNode.domNode.textContent = newText + hNode.domNode.textContent!;
};

const deleteNextText = (hNodes: HNodeText[], oldText: string) => {
  if (hNodes.length === 0) {
    return;
  }

  const nextTextHNode = hNodes[0];

  nextTextHNode.domNode.textContent = nextTextHNode.domNode.textContent!.slice(
    oldText.length
  );
  hNodes.forEach((hNodeText) => {
    hNodeText.start -= oldText.length;
  });
};

const addNextText = (hNodes: HNodeText[], newText: string) => {
  if (hNodes.length === 0) {
    return;
  }

  const nextTextHNode = hNodes[0];

  nextTextHNode.domNode.textContent =
    newText + nextTextHNode.domNode.textContent!;
  hNodes.forEach((hNodeText) => {
    hNodeText.start += newText.length;
  });
};

const a = (vNews: VNew[], vOlds: VOld[], hNode: HNode) => {
  const lastVNewPosision = vNews.length - 1;
  const lastVNew = vNews[lastVNewPosision];
  const lastVOld = vOlds[vOlds.length - 1];

  if (lastVOld.type === 'text' || lastVNew.type === 'text') {
    const nextTextHNodes = findNextTextNodes(hNode);
    if (lastVOld.type === 'text') {
      deleteNextText(nextTextHNodes, lastVOld.text);
    }

    if (lastVNew.type === 'text') {
      addNextText(nextTextHNodes, lastVNew.text);
    }
  }

  if (vNews.length === 0 || (vNews.length === 1 && vNews[0].type === 'text')) {
  }
  for (let i = 0; i <= Math.max(vNews.length, vOlds.length); i++) {
    const vNew: VNew | undefined = vNews[i];
    const vOld: VOld | undefined = vOlds[i];

    if (lastVNewPosision === i) {
    }

    if (vNews.length === 1) {
    }

    if (vOlds.length === 0) {
    }
    if (lastVNewPosision === i) {
      const lastMeangingVOld = vOlds[vOlds.length - 1];

      if (lastMeangingVOld.type === 'text') {
        const vNewText = vNew as VNewText;
        const nextTextHNodes = findNextTextNodes(hNode);
        if (nextTextHNodes.length > 0) {
          const firstNextTextNode = nextTextHNodes[0];

          if (lastVOld.type === 'text') {
            const lengthDiff = vNewText.text.length - lastVOld.text.length;
            firstNextTextNode.domNode.textContent =
              vNewText.text +
              firstNextTextNode.domNode.textContent!.slice(
                lastVOld.text.length
              );

            nextTextHNodes.forEach((hNodeText) => {
              hNodeText.start += lengthDiff;
            });
          } else {
            firstNextTextNode.domNode.textContent =
              vNewText.text + firstNextTextNode.domNode.textContent!;
            nextTextHNodes.forEach((hNodeText) => {
              hNodeText.start += vNewText.text.length;
            });
          }
        }
        // standart handle
      } else {
      }
      // standart handle
    }
  }
};
