import {Atom} from 'strangelove';
import {HNode} from '../../h-node/h-node.ts';
import {AnyFunc} from '../../types.ts';
import {HNodeAtomWrapper} from '../../h-node/component.ts';

export const subscribeAtomWrapper = ({
  hNode,
  exec,
}: {
  exec: AnyFunc;
  hNode: HNodeAtomWrapper;
}) => {
  const atom = hNode.atom;
  const links = hNode.globalCtx.root.atomsStore;
  hNode.mounts.push(() => {
    links.addExec(atom, exec);
    const linkHandler = links.get(hNode.atom)!;
    linkHandler.atomWrappers.push(hNode);

    const unsubscribe = () => {
      links.removeExec(atom, exec);

      linkHandler.atomWrappers = linkHandler.atomWrappers.filter(
        (atomWrapper) => atomWrapper !== hNode
      );
    };

    hNode.unsibscribeWrapper = () => {
      unsubscribe();

      hNode.unmounts = hNode.unmounts.filter(
        (unsubscribeLocal) => unsubscribeLocal !== unsubscribe
      );

      hNode.unsibscribeWrapper = undefined;
    };

    hNode.unmounts.push(unsubscribe);
  });
};

export const subscribeAtom = ({
  exec,
  hNode,
  atom,
}: {
  exec: AnyFunc;
  hNode: HNode;
  atom: Atom;
}) => {
  hNode.mounts.push((hNode) => {
    hNode.globalCtx.root.atomsStore.addExec(atom, exec);

    hNode.unmounts.push(() => {
      hNode.globalCtx.root.atomsStore.removeExec(atom, exec);
    });
  });
};
