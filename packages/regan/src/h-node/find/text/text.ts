import {HNodeElement} from '../../element.ts';
import {HNode} from '../../h-node.ts';
import {HNodeText} from '../../text.ts';
import {findNextHNode} from '../next.ts';
import {findPrevHNode} from '../prev.ts';

export const findPrevTextHNode = (hNode: HNode) => {
  const nextTextHNode = findPrevHNode(hNode, (hNode) => {
    if (hNode instanceof HNodeElement) {
      return 'stop';
    }

    if (hNode instanceof HNodeText) {
      return hNode;
    }
  });

  return nextTextHNode as HNodeText | undefined;
};

export const findNextTextHNode = (hNode: HNode): HNodeText | undefined => {
  const nextHNode = findNextHNode(hNode, (hNode) => {
    if (hNode instanceof HNodeElement) {
      return 'stop';
    }

    if (hNode instanceof HNodeText) {
      return hNode;
    }
  });

  return nextHNode as HNodeText | undefined;
};

export const sumPrevText = (hNode: HNodeText) => {
  const prevTextHNodes = findPrevTextHNodes(hNode);

  let text = hNode.text;
  prevTextHNodes.forEach((prevTextHNode) => {
    text = prevTextHNode.text + text;
  });
  return text;
};

export const findPrevTextHNodes = (hNode: HNode): HNodeText[] => {
  const nodes = [];
  let nextNode = findPrevTextHNode(hNode);
  while (nextNode) {
    nodes.push(nextNode);
    nextNode = findPrevTextHNode(nextNode);
  }
  return nodes;
};

// export const findNextTextHNodes = (hNode: HNode): HNodeText[] => {
//   const nodes = [];
//   let nextNode = findNextTextHNode(hNode);
//   while (nextNode) {
//     nodes.push(nextNode);
//     nextNode = findNextTextHNode(nextNode);
//   }
//   return nodes;
// };
