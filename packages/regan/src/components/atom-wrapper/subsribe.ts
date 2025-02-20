import {AtomWrapperData} from '../../h-node/component.ts';
import {AnyFunc} from '../../types.ts';

export const subscribeAtomWrapper = ({
  exec,
  atomWrapperData,
}: {
  exec: AnyFunc;
  atomWrapperData: AtomWrapperData;
}) => {
  const atom = atomWrapperData.atom;
  const hNode = atomWrapperData.hNode;
  const links = atomWrapperData.hNode.globalCtx.root.atomsStore;

  hNode.mounts.push(() => {
    links.addExec(atom, exec);
    const linkHandler = links.get(atom)!;
    linkHandler.atomWrappers.push(atomWrapperData);

    const unsubscribe = () => {
      links.removeExec(atom, exec);

      linkHandler.atomWrappers = linkHandler.atomWrappers.filter(
        (atomWrapperDataLocal) => atomWrapperData !== atomWrapperDataLocal
      );
    };

    atomWrapperData.unsibscribeWrapper = () => {
      unsubscribe();

      hNode.unmounts = hNode.unmounts.filter(
        (unsubscribeLocal) => unsubscribeLocal !== unsubscribe
      );

      atomWrapperData.unsibscribeWrapper = undefined;
    };

    hNode.unmounts.push(unsubscribe);
  });
};
