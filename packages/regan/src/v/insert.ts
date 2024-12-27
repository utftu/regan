import {DomPointer} from '../types.ts';
import {getNodeFromVOld} from './handle.ts';
import {VOld} from './types.ts';

export const insertChild = ({
  // parent,
  prevVNew,
  node,
  domPointer,
}: // vOld,
{
  // parent: ParentNode;

  prevVNew: VOld | void;
  node: Node;
  // vOld: VOld | void;
  domPointer: DomPointer;
}) => {
  if (prevVNew) {
    const prevDomNode = getNodeFromVOld(prevVNew);
    prevDomNode.after(node);
    return;
  }

  const prevNode = domPointer.parent.childNodes[domPointer.nodeCount - 1];

  if (prevNode) {
    prevNode.after(node);
  }

  domPointer.parent.prepend(node);

  // if (vOld) {
  //   const vOldDomNode = getDomNode(vOld);
  //   vOldDomNode.after(node);
  //   return;
  // }

  // parent.appendChild(node);
};
