import {DomPointer} from '../types.ts';
import {getNodeFromVOld} from './handle.ts';
import {VOld} from './types.ts';

export const insertChild = ({
  prevVNew,
  node,
  domPointer,
}: {
  prevVNew: VOld | void;
  node: Node;
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
    return;
  }

  domPointer.parent.prepend(node);
};
