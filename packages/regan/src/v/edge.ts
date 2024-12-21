import {HNode} from '../h-node/h-node.ts';
import {
  findNextTextNode,
  findPrevTextNode,
} from '../h-node/helpers/find-text.ts';
import {HNodeText} from '../h-node/text.ts';
import {VNew, VNewText, VOld, VOldText} from './types.ts';

const convertTextNewInOld = (vNew: VNewText, textNode: Text) => {
  const vOld = vNew as VOldText;

  vOld.textNode = textNode;
  vOld.init?.(vOld);
};

const findNextTextNodes = (hNode: HNode) => {
  const nodes = [];
  let nextNode = findNextTextNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findNextTextNode(nextNode);
  }
  return nodes;
};

const recalculateNextTextHNodes = (
  hNodes: HNodeText[],
  textNode: Text,
  startPosition: number = 0
) => {
  let start = startPosition;

  hNodes.forEach((hNode) => {
    hNode.start = start;
    hNode.textNode = textNode;
    start += hNode.text.length;
  });
};

const split = ({
  nextTextHNodes,
  window,
}: {
  nextTextHNodes: ReturnType<typeof findNextTextNodes>;
  window: Window;
}) => {
  const nextTextHNode = nextTextHNodes[0];

  if (nextTextHNode) {
    const newNode = window.document.createTextNode(
      nextTextHNode.textNode.textContent!.slice(nextTextHNode.start)
    );

    // const nextTextHNodes = findNextTextNodes(hNode);
    const oldLeftTextNode = nextTextHNode.textNode;
    recalculateNextTextHNodes(nextTextHNodes, newNode);

    oldLeftTextNode.textContent = oldLeftTextNode.textContent!.slice(
      0,
      nextTextHNode.start
    );
  }
};

const join = ({
  prevTextHNode,
  nextTextHNodes,
  text,
}: {
  prevTextHNode: HNodeText | void;
  nextTextHNodes: HNodeText[];
  text: string;
}) => {
  const nextTextHNode = nextTextHNodes[0] as HNodeText | void;
  if (prevTextHNode && nextTextHNode) {
    const leftPartFinishPosition =
      prevTextHNode.start + prevTextHNode.text.length + text.length;
    prevTextHNode.textNode.textContent +=
      text + nextTextHNode.textNode.textContent!;

    nextTextHNodes.forEach((nextTextHNode) => {
      nextTextHNode.textNode = prevTextHNode.textNode;
      nextTextHNode.start = leftPartFinishPosition + nextTextHNode.start;
    });
  } else if (prevTextHNode) {
    prevTextHNode.textNode.textContent += text;
  } else if (nextTextHNode) {
    nextTextHNode.textNode.textContent =
      text + nextTextHNode.textNode.textContent;
    recalculateNextTextHNodes(
      nextTextHNodes,
      nextTextHNode.textNode,
      text.length
    );
  }
};

const shrinkMiddleTextAfterSplit = ({
  prevTextHNode,
}: {
  prevTextHNode: HNodeText;
}) => {
  prevTextHNode.textNode.textContent =
    prevTextHNode.textNode.textContent!.slice(
      0,
      prevTextHNode.start + prevTextHNode.text.length
    );
};

export const handleEdgeTextCases = (
  vNews: VNew[],
  vOlds: VOld[],
  hNode: HNode,
  window: Window
) => {
  const lastVNew = vNews[vNews.length - 1] as VNew | void;
  const lastVOld = vOlds[vOlds.length - 1] as VOld | void;
  const firstVNew = vNews[0] as VNew | void;
  const firstVOld = vOlds[0] as VOld | void;

  const prevTextHNode = findPrevTextNode(hNode);
  const nextTextHNodes = findNextTextNodes(hNode);
  const nextTextHNode = nextTextHNodes[0];

  const needPureSplitFull = vOlds.length === 0;
  const needSplitAndDeleteFull = vOlds.length === 1 && vOlds[0].type === 'text';
  const needSplitFull = needPureSplitFull || needSplitAndDeleteFull;

  const needPureJoinFull = vNews.length === 0;
  const needJoinAndAddFull = vOlds.length === 1 && vOlds[0].type === 'text';
  const needJoinFull = needPureJoinFull && needPureJoinFull;

  const actions: (() => void)[] = [];

  // split
  if (needPureSplitFull) {
    actions.push(() => split({nextTextHNodes, window}));
  }

  // split and delete text
  if (needSplitAndDeleteFull) {
    const vOld = vOlds[0] as VOldText;

    actions.push(() => {
      split({nextTextHNodes, window});

      if (prevTextHNode && vOld.data.text !== '') {
        shrinkMiddleTextAfterSplit({prevTextHNode});
      }
    });

    if (prevTextHNode) {
      vOld.meta.skip = true;
    }
  }

  // split only last part
  if (!needSplitFull && lastVOld && lastVOld.type === 'text') {
    if (nextTextHNode) {
      actions.push(() => {
        nextTextHNode.textNode.textContent =
          nextTextHNode.textNode.textContent!.slice(lastVOld.data.text.length);
        recalculateNextTextHNodes(nextTextHNodes, lastVOld.textNode, 0);
      });
      lastVOld.meta.skip = true;
    }
  }

  // split only first part
  if (
    !needSplitFull &&
    firstVOld &&
    firstVOld.type === 'text' &&
    prevTextHNode
  ) {
    actions.push(() => {
      prevTextHNode.textNode.textContent =
        prevTextHNode.textNode.textContent!.slice(
          0,
          // todo maybe calculate only on prevTextHNode
          -firstVOld.data.text.length
        );
    });
    firstVOld.meta.skip = true;
  }

  // join
  if (needPureJoinFull) {
    actions.push(() => {
      join({
        nextTextHNodes,
        prevTextHNode,
        text: '',
      });
    });
  }

  // join and add text
  if (needJoinAndAddFull) {
    const vNew = vNews[0] as VNewText;

    actions.push(() => {
      join({
        nextTextHNodes,
        prevTextHNode,
        text: vNew.data.text,
      });
    });

    if (prevTextHNode || nextTextHNode) {
      vNew.meta.skip = true;
    }
  }

  // join only first part
  if (
    !needJoinFull &&
    firstVNew &&
    firstVNew.type === 'text' &&
    prevTextHNode
  ) {
    actions.push(() => {
      prevTextHNode.textNode.textContent += firstVNew.data.text;
      convertTextNewInOld(firstVNew, prevTextHNode.textNode);
    });
    firstVNew.meta.skip = true;
  }

  // join only last part
  if (!needJoinFull && lastVNew && lastVNew.type === 'text' && nextTextHNode) {
    actions.push(() => {
      nextTextHNode.textNode.textContent =
        lastVNew.data.text + nextTextHNode.textNode.textContent!;

      recalculateNextTextHNodes(
        nextTextHNodes,
        nextTextHNode.textNode,
        lastVNew.data.text.length
      );

      convertTextNewInOld(lastVNew, nextTextHNode.textNode);
    });

    lastVNew.meta.skip = true;
  }

  return actions;
};