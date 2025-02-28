import {HNode} from '../h-node/h-node.ts';
import {
  findNextTextHNodes,
  findPrevTextHNode,
} from '../h-node/utils/find/text/text.ts';
import {HNodeText} from '../h-node/text.ts';
import {setSkip} from './skip.ts';
import {VNew, VNewText, VOld, VOldText} from './types.ts';

const convertTextNewInOld = (vNew: VNewText, textNode: Text) => {
  const vOld = vNew as VOldText;

  vOld.textNode = textNode;
  vOld.init?.(vOld);
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
  nextTextHNodes: HNodeText[];
  window: Window;
}) => {
  console.log('-----', 'split');
  const nextTextHNode = nextTextHNodes[0];

  if (nextTextHNode) {
    const newNode = window.document.createTextNode(
      nextTextHNode.textNode.textContent!.slice(nextTextHNode.start)
    );

    const oldRightStart = nextTextHNode.start;

    const oldLeftTextNode = nextTextHNode.textNode;
    recalculateNextTextHNodes(nextTextHNodes, newNode);

    oldLeftTextNode.textContent = oldLeftTextNode.textContent!.slice(
      0,
      oldRightStart
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
    prevTextHNode.textNode.textContent =
      prevTextHNode.textNode.textContent! +
      text +
      nextTextHNode.textNode.textContent!;

    nextTextHNodes.forEach((nextTextHNode) => {
      nextTextHNode.textNode = prevTextHNode.textNode;
      nextTextHNode.start = leftPartFinishPosition + nextTextHNode.start;
    });

    return prevTextHNode.textNode;
  } else if (prevTextHNode) {
    prevTextHNode.textNode.textContent += text;
    return prevTextHNode.textNode;
  } else if (nextTextHNode) {
    nextTextHNode.textNode.textContent =
      text + nextTextHNode.textNode.textContent;
    recalculateNextTextHNodes(
      nextTextHNodes,
      nextTextHNode.textNode,
      text.length
    );
    return nextTextHNode.textNode;
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

  const prevTextHNode = findPrevTextHNode(hNode);
  const nextTextHNodes = findNextTextHNodes(hNode);
  const nextTextHNode = nextTextHNodes[0];

  const needPureSplitFull = vOlds.length === 0;
  const needSplitAndDeleteFull = vOlds.length === 1 && vOlds[0].type === 'text';
  const needSplitFull = needPureSplitFull || needSplitAndDeleteFull;

  const needPureJoinFull = vNews.length === 0;
  const needJoinAndAddFull = vNews.length === 1 && vNews[0].type === 'text';
  const needJoinFull = needPureJoinFull || needJoinAndAddFull;

  const actions: (() => void)[] = [];

  // split
  if (needPureSplitFull) {
    actions.push(() => split({nextTextHNodes, window}));
  }

  // split and delete text
  if (needSplitAndDeleteFull) {
    console.log('-----', 'delete');
    const vOld = vOlds[0] as VOldText;

    actions.push(() => {
      split({nextTextHNodes, window});

      if (prevTextHNode && vOld.data.text !== '') {
        console.log('-----', 'shrink');
        shrinkMiddleTextAfterSplit({prevTextHNode});
      }
    });

    if (prevTextHNode) {
      setSkip(vOld);
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
      setSkip(lastVOld);
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
    setSkip(firstVOld);
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
      const textNode = join({
        nextTextHNodes,
        prevTextHNode,
        text: vNew.data.text,
      });
      convertTextNewInOld(vNew, textNode!);
    });

    if (prevTextHNode || nextTextHNode) {
      setSkip(vNew);
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
    setSkip(firstVNew);
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

    setSkip(lastVNew);
  }

  return actions;
};
