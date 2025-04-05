import {
  findNextTextHNode,
  findPrevTextHNode,
} from '../../h-node/find/text/text.ts';
import {HNode} from '../../h-node/h-node.ts';
import {DomPointer} from '../../types.ts';
import {VNew, VOld, VOldText} from '../../v/types.ts';
import {virtualApply} from '../../v/v.ts';

// v can be compared only with neighbour text nodes
const a = ({
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

  const preparedVNews: VNew[] = vNews;
  const preparedVOlds: VOld[] = vOlds;

  // connect neighbour text nodes temporarily to compare

  if (prevTextHNode) {
    if (firstVNew?.type === 'text') {
      firstVNew.data.text = prevTextHNode.text + firstVNew.data.text;
    } else {
      const vNew: VNew = {
        type: 'text',
        data: {
          text: prevTextHNode.text,
        },
      };

      preparedVNews.unshift(vNew);
    }

    if (firstVOld?.type === 'text') {
      firstVOld.data.text = prevTextHNode.text + firstVOld.data.text;
    } else {
      const vOld: VOld = {
        type: 'text',
        data: {
          text: prevTextHNode.text,
        },
        textNode: prevTextHNode.textNode,
      };

      preparedVOlds.unshift(vOld);
    }
  }

  if (nextTextHNode) {
    if (firstVNew?.type === 'text') {
      firstVNew.data.text += nextTextHNode.text;
    } else {
      const vNew: VNew = {
        type: 'text',
        data: {
          text: nextTextHNode.text,
        },
      };

      preparedVNews.push(vNew);
    }

    if (firstVOld?.type === 'text') {
      firstVOld.data.text += nextTextHNode.text;
    } else {
      const vOld: VOld = {
        type: 'text',
        data: {
          text: nextTextHNode.text,
        },
        textNode: nextTextHNode.textNode,
      };

      preparedVOlds.push(vOld);
    }
  }

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

    if (prevTextHNode.vOld) {
      prevTextHNode.vOld.textNode = firstVNewOld.textNode;
    }

    if (firstVNew?.type === 'text') {
      firstVNewOld.data.text = firstVNew.data.text;
    } else {
      newVOlds.shift();
    }
  }

  if (nextTextHNode) {
    const lastVNewOld = newVOlds[newVOlds.length - 1] as VOldText;
    nextTextHNode.textNode = lastVNewOld.textNode;

    if (nextTextHNode.vOld) {
      nextTextHNode.vOld.textNode = lastVNewOld.textNode;
    }

    if (lastVNewOld.type === 'text') {
      lastVNewOld.data.text = lastVNewOld.data.text;
    } else {
      newVOlds.pop();
    }
  }
};
