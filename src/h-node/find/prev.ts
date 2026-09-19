import {checkClassChild} from '../../utils/check-parent.ts';
import {HNodeElement} from '../element.ts';
import {HNode} from '../h-node.ts';
import {Checker, CheckerAnswer, Config} from './find.ts';

// element boundary
// sure not that HNode
export const findPrevHNode = (
  hNode: HNode,
  checker: Checker,
  config: Config = {}
) => {
  const result = findPrevUp(hNode, checker, config);

  if (checkClassChild(result, 'hNode')) {
    return result;
  }
};

const findPrevUp = (
  hNode: HNode,
  checker: Checker,
  config: Config
): CheckerAnswer => {
  const checkingHNode = hNode.parent;

  if (!checkingHNode) {
    return;
  }

  config.lastParentHNode = checkingHNode;

  const childPosition = checkingHNode.children.indexOf(hNode);

  for (let i = childPosition - 1; i >= 0; i--) {
    const child = checkingHNode.children[i];

    const downAnswer = findPrevDown(child, checker);
    if (checkClassChild(downAnswer, 'hNode')) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return;
    }
  }

  if (checkClassChild(checkingHNode, 'hNodeElement')) {
    return;
  }

  return findPrevUp(checkingHNode, checker, config);
};

const findPrevDown = (hNode: HNode, checker: Checker): CheckerAnswer => {
  const checkerAnswer = checker(hNode);

  if (checkClassChild(checkerAnswer, 'hNode')) {
    return hNode;
  }

  if (checkerAnswer === 'stop') {
    return 'stop';
  }

  for (let i = hNode.children.length - 1; i >= 0; i--) {
    const child = hNode.children[i];

    const downAnswer = findPrevDown(child, checker);

    if (checkClassChild(downAnswer, 'hNode')) {
      return downAnswer;
    }

    if (downAnswer === 'stop') {
      return 'stop';
    }
  }
};
