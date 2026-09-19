import {
  findNextTextHNode,
  findPrevTextHNode,
  sumNextText,
  sumPrevText,
} from '../../h-node/find/text/text.ts';
import {HNode} from '../../h-node/h-node.ts';
import {DomPointer} from '../../types.ts';
import {VNew, VOld} from '../../v/types.ts';
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
  const firstVOld = vOlds[0] as VOld | void;

  const lastVNew = vNews[vNews.length - 1] as VNew | void;

  const preparedVNews: VNew[] = vNews;
  const preparedVOlds: VOld[] = vOlds;

  // connect neighbour text nodes temporarily to compare

  if (prevTextHNode) {
    const textContent = prevTextHNode.textNode.textContent!;
    if (firstVNew?.type === 'text') {
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
    const nextText = sumNextText(nextTextHNode);
    debugger;
    if (lastVNew?.type === 'text') {
      lastVNew.data.text = lastVNew.data.text + nextText;
    } else {
      const vNew: VNew = {
        type: 'text',
        data: {
          text: textContent,
        },
      };

      preparedVNews.push(vNew);
    }
  }

  virtualApply({
    vNews: preparedVNews,
    vOlds: preparedVOlds,
    window,
    domPointer,
  });
};
