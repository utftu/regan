import {Atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {HNode} from '../../h-node/h-node.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {rednerRaw} from '../../render/render.ts';
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
  if (globalCtx.mode === 'server') {
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
      node: children[0] as JSXNode,
      window: hNode.hNodeCtx.window,
      getElemPointer() {
        const parent = findParentElement(hNode);

        if (!parent) {
          return hNode.hNodeCtx.getInitElemPointer();
        }

        const prev = findPrevElement(hNode);

        return {
          parent,
          prev,
        } as ElementPointer;
      },
      parentHNode: hNode,
    });

    childMount();
  };

  mount(() => {
    globalCtx.root.replaceExec(when, tempExec, exec);

    if (changedBeforeMount === true) {
      exec(when.get());
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
