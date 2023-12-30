import {Atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {rednerRaw} from '../../render/render.ts';
import {JSXNode} from '../../node/node.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';

type Props = {
  when: Atom<any>;
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
