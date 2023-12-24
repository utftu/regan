import {Atom, select} from 'strangelove';
import {FC} from '../../types.ts';
import {subscribeAtomChange} from '../../atoms/atoms.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {redner, rednerRaw} from '../../render/render.ts';
import {JSXNode} from '../../node/node.ts';

type Props = {
  when: Atom<any>;
};

const findParentElement = (hNode: HNode): HTMLElement | void => {
  if (hNode instanceof HNodeElement) {
    return hNode.el;
  }

  if (!hNode.parent) {
    return;
  }

  return findParentElement(hNode.parent);
};

const findPrevElement = (hNode: HNode) => {
  if (!hNode.parent) {
    throw new Error('single child');
  }

  return up(hNode.parent, hNode.jsxSegment.parent!.position);
};

const up = (
  hNode: HNode,
  stopIteratePosition: number = 0
): HTMLElement | void => {
  // if (hNode instanceof HNodeElement) {
  //   return hNode.el;
  // }

  const possibleDownEl = down(hNode.children, stopIteratePosition);
  if (possibleDownEl) {
    return possibleDownEl;
  }

  if (!hNode.parent) {
    return;
  }

  const possibleUpEl = up(hNode.parent, hNode.jsxSegment.parent!.position);
  if (possibleUpEl) {
    return possibleUpEl;
  }
};

const down = (
  hNodes: HNode[],
  stopIteratePosition: number = 0
): HTMLElement | void => {
  for (let i = hNodes.length - 1; i > stopIteratePosition; i--) {
    const childHNode = hNodes[i];

    if (childHNode instanceof HNodeElement) {
      return childHNode.el;
    }

    const possibleEl = down(childHNode.children);

    if (possibleEl) {
      return possibleEl;
    }
  }
};

export const Show: FC<Props> = (
  {when},
  {hNode, globalCtx, mount, unmount, children}
) => {
  if (globalCtx.stage === 'string') {
    if (!!when.get() === false) {
      return null;
    }
    return children;
  }

  let changedBeforeMount = false;
  const tempExec = () => {
    changedBeforeMount = true;
  };
  globalCtx.root.addExec(when, tempExec);
  const exec = async (value: boolean) => {
    const parentEl = findParentElement(hNode);

    if (!parentEl) {
      throw new Error('no parent el??????');
    }

    const prevEl = findPrevElement(hNode);

    hNode.children.forEach((hNodeChild) => {
      hNodeChild.unmount();
      hNodeChild.parent = undefined;
    });
    hNode.children.length = 0;

    if (hNode.unmounted === true) {
      return;
    }

    if (value === false) {
      return;
    }

    const {mount: childMount} = await rednerRaw({
      node: children[0],
      options: {
        window: globalCtx.window,
        parentHNode: hNode,
      },
    });

    childMount({parent: parentEl, prevEl});
  };

  mount(() => {
    globalCtx.root.replaceExec(when, tempExec, exec);

    if (changedBeforeMount === true) {
      exec();
    }
  });
  unmount(() => {
    globalCtx.root.removeExec(when, exec);
  });

  if (!!when.get() === false) {
    return null;
  }
  return children;
};
