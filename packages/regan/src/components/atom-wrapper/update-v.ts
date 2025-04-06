import {
  findNextTextHNode,
  findPrevTextHNode,
  sumNextText,
  sumPrevText,
} from '../../h-node/find/text/text.ts';
import {HNode} from '../../h-node/h-node.ts';
import {DomPointer} from '../../types.ts';
import {VNew, VOld, VOldText} from '../../v/types.ts';
import {virtualApply} from '../../v/v.ts';

// v can be compared only with neighbour text nodes
export const updateV = ({
  vNews,
  vOlds,
  hNode,
  window,
  domPointer,
}: {
  vNews: VNew[];
  vOlds: VOld[];
  hNode: HNode;
  window: Window;
  domPointer: DomPointer;
}) => {
  const prevTextHNode = findPrevTextHNode(hNode);
  const nextTextHNode = findNextTextHNode(hNode);

  const firstVNew = vNews[0] as VNew | void;
  const savedTextFirstVNew =
    firstVNew?.type === 'text' ? firstVNew.data.text : undefined;
  const firstVOld = vOlds[0] as VOld | void;

  const lastVNew = vNews[vNews.length - 1] as VNew | void;
  const savedTextLastVNew =
    lastVNew?.type === 'text' ? lastVNew.data.text : undefined;
  const lastVOld = vOlds[vOlds.length - 1] as VOld | void;

  const preparedVNews: VNew[] = vNews;
  const preparedVOlds: VOld[] = vOlds;

  // connect neighbour text nodes temporarily to compare

  if (prevTextHNode) {
    const textContent = prevTextHNode.textNode.textContent!;
    if (firstVNew?.type === 'text') {
      console.log('-----', 'prev', sumPrevText(prevTextHNode));
      debugger;
      firstVNew.data.text = sumPrevText(prevTextHNode) + firstVNew.data.text;
    } else {
      const vNew: VNew = {
        type: 'text',
        data: {
          text: textContent,
        },
      };

      preparedVNews.unshift(vNew);
    }

    if (firstVOld?.type === 'text') {
      firstVOld.data.text = textContent;

      // firstVOld.data.text = textContent + firstVOld.data.text;
    } else {
      const vOld: VOld = {
        type: 'text',
        data: {
          text: textContent,
        },
        textNode: prevTextHNode.textNode,
      };

      preparedVOlds.unshift(vOld);
    }
  }

  if (nextTextHNode) {
    const textContent = nextTextHNode.textNode.textContent!;
    if (lastVNew?.type === 'text') {
      lastVNew.data.text = sumNextText(nextTextHNode) + lastVNew.data.text;
    } else {
      const vNew: VNew = {
        type: 'text',
        data: {
          text: textContent,
        },
      };

      preparedVNews.push(vNew);
    }

    // if (lastVOld?.type === 'text') {
    //   lastVOld.data.text += nextTextHNode.text;
    // } else {
    //   const vOld: VOld = {
    //     type: 'text',
    //     data: {
    //       text: nextTextHNode.text,
    //     },
    //     textNode: nextTextHNode.textNode,
    //   };

    //   preparedVOlds.push(vOld);
    // }
  }

  console.log('-----', 'preparedVNews', preparedVNews);
  console.log('-----', 'preparedVOlds', preparedVOlds);

  const newVOlds = virtualApply({
    vNews: preparedVNews,
    vOlds: preparedVOlds,
    window,
    domPointer,
  });

  // split neighbour text nodes and update neighbour

  if (prevTextHNode) {
    const firstVNewOld = newVOlds[0] as VOldText;
    prevTextHNode.textNode = firstVNewOld.textNode;

    // if (prevTextHNode.vOld) {
    //   prevTextHNode.vOld.textNode = firstVNewOld.textNode;
    // }

    if (firstVNew?.type === 'text') {
      firstVNewOld.data.text = savedTextFirstVNew!;
    } else {
      newVOlds.shift();
    }
  }

  if (nextTextHNode) {
    const lastVNewOld = newVOlds[newVOlds.length - 1] as VOldText;
    nextTextHNode.textNode = lastVNewOld.textNode;

    // if (nextTextHNode.vOld) {
    //   nextTextHNode.vOld.textNode = lastVNewOld.textNode;
    // }

    if (lastVOld?.type === 'text') {
      lastVNewOld.data.text = savedTextLastVNew!;
    } else {
      newVOlds.pop();
    }
  }

  return newVOlds;
};
