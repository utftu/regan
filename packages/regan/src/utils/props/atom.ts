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
  const links = hNode.globalCtx.root.links;
  hNode.mounts.push(() => {
    links.addExec(atom, exec);
    const linkHandler = links.get(hNode.atom)!;
    linkHandler.atomWrappers.push(hNode);

    hNode.unmounts.push(() => {
      links.removeExec(atom, exec);
      linkHandler.atomWrappers = linkHandler.atomWrappers.filter(
        (atomWrapper) => atomWrapper !== hNode
      );
    });
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
    hNode.globalCtx.root.links.addExec(atom, exec);

    hNode.unmounts.push(() => {
      hNode.globalCtx.root.links.removeExec(atom, exec);
    });
  });
};
