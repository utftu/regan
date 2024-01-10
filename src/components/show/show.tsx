import {Atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {rednerRaw} from '../../render/render.ts';
// import {JSXNode} from '../../node/node.ts';
import {Fragment} from '../fragment/fragment.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';
import {unmountHNodes} from '../../h-node/h-node.ts';

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
    return <Fragment>{children}</Fragment>;
  }
  const clientHNode = hNode!;

  let changedBeforeMount = false;
  const tempExec = () => {
    changedBeforeMount = true;
  };
  globalCtx.root.addExec(when, tempExec);
  const exec = async (value: boolean) => {
    clientHNode.children.forEach((hNodeChild) => {
      unmountHNodes(hNodeChild);
      hNodeChild.parent = undefined;
    });
    clientHNode.children.length = 0;

    if (clientHNode.unmounted === true) {
      return;
    }

    if (value === false) {
      return;
    }

    const {mount: childMount} = await rednerRaw({
      node: <Fragment>{children}</Fragment>,
      window: clientHNode.hNodeCtx.window,
      getElemPointer() {
        const parent = findParentElement(clientHNode);

        if (!parent) {
          return clientHNode.hNodeCtx.getInitElemPointer();
        }

        const prev = findPrevElement(clientHNode);

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

  // return children;
  return <Fragment>{children}</Fragment>;
};
