import {
  findNextTextHNode,
  findPrevTextHNode,
} from '../../h-node/find/text/text.ts';
import {HNode} from '../../h-node/h-node.ts';
import {VNew, VOld, VOldText} from '../../v/types.ts';

const a = (vNews: VNew[], vOlds: VOld[], hNode: HNode) => {
  const prevTextHNode = findPrevTextHNode(hNode);
  const nextTextHNode = findNextTextHNode(hNode);

  const firstVNew: VNew | void = vNews[0];
  const firstVOld: VOld | void = vOlds[0];

  const preparedVNews: VNew[] = [];
  const preparedVOlds: VOld[] = [];

  if (prevTextHNode) {
    const vOld: VOldText = {
      type: 'text',
      data: {
        text: prevTextHNode.text,
      },
      textNode: prevTextHNode.textNode,
    };

    if (firstVNew.type === 'text') {
      firstVNew.data.text = prevTextHNode.text + firstVNew.data.text;
    }
  }
};
