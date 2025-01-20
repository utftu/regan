import {Atom} from 'strangelove';
import {HNode} from '../../h-node/h-node.ts';
import {AynFunc} from '../../types.ts';

export const subscribeAtom = ({
  // tempExec,
  exec,
  hNode,
  atom,
}: {
  // tempExec: AynFunc;
  exec: AynFunc;
  hNode: HNode;
  atom: Atom;
}) => {
  // hNode.globalCtx.root.links.addExec(atom, tempExec);
  // const tempUmount = () => {
  //   hNode.globalCtx.root.links.removeExec(atom, tempExec);
  // };
  // hNode.segmentEnt.unmounts.push(tempUmount);

  hNode.mounts.push((hNode) => {
    // hNode.segmentEnt.unmounts = hNode.segmentEnt.unmounts.filter(
    //   (item) => item !== tempUmount
    // );
    // hNode.globalCtx.root.links.replaceExec(atom, tempExec, exec);

    hNode.unmounts.push(() => {
      hNode.globalCtx.root.links.removeExec(atom, exec);
    });
  });
};
