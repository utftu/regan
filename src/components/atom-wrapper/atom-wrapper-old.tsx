import {Atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {unmountHNodes} from '../../h-node/h-node.ts';
import {rednerRaw} from '../../render/render.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';

type Props = {
  atom: Atom;
};

// todo
export const AtomWrapper: FC<Props> = (
  {atom},
  {hNode, globalCtx, mount, unmount, children}
) => {
  if (globalCtx.mode === 'server') {
    return <Fragment>{atom.get()}</Fragment>;
  }
  const clientHNode = hNode!;

  let changedBeforeMount = false;
  const tempExec = () => {
    changedBeforeMount = true;
  };
  globalCtx.root.addExec(atom, tempExec);
  const exec = async () => {
    clientHNode.children.forEach((hNodeChild) => {
      unmountHNodes(hNodeChild);
      hNodeChild.parent = undefined;
    });
    clientHNode.children.length = 0;
    // console.log('-----', 'here');

    if (clientHNode.unmounted === true) {
      return;
    }

    const {mount: childMount} = await rednerRaw({
      node: <Fragment>{atom.get()}</Fragment>,
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
    globalCtx.root.replaceExec(atom, tempExec, exec);

    if (changedBeforeMount === true) {
      exec();
    }
  });
  unmount(() => {
    globalCtx.root.removeExec(atom, exec);
  });

  return <Fragment>{atom.get()}</Fragment>;
};
