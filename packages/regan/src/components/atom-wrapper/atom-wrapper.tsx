import {Atom} from 'strangelove';
import {FC, FCStaticParams} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {rednerVirtual} from '../../render/render.ts';
import {NEED_AWAIT} from '../../consts.ts';
import {detachChildren} from '../../h-node/helpers.ts';
import {subscribeAtomWrapper} from '../../utils/props/atom.ts';
import {VOld} from '../../v/types.ts';
import {HNodeAtomWrapper} from '../../h-node/component.ts';
import {getInsertDomPointer, markAsWillUnmount, parseAtom} from './helpers.ts';
import {HNode} from '../../h-node/h-node.ts';

type Props = {
  atom: Atom;
};

const AtomWrapper: FC<Props> & FCStaticParams = (
  {atom},
  {hNode, globalCtx, mount, unmount, stage, ctx, client, segmentEnt}
) => {
  const {jsxSegment} = segmentEnt;
  const initJsxSegmentName = jsxSegment.name;

  // toString()
  if (globalCtx.mode === 'server') {
    const {additionalPart, value} = parseAtom(atom, false);

    jsxSegment.name += additionalPart;
    return <Fragment>{value}</Fragment>;
  }

  const clientHNode = hNode! as HNodeAtomWrapper;

  let vOldsStore: VOld[] | undefined = [];

  subscribeAtomWrapper({
    hNode: clientHNode,
    exec: async () => {
      //
      if (clientHNode.unmounted === true) {
        return;
      }

      if (clientHNode.willUnmount === true) {
        return;
      }

      clientHNode.rendering = true;

      detachChildren(clientHNode);

      jsxSegment.clearCache();

      const {value, additionalPart} = parseAtom(atom, false);
      jsxSegment.name = initJsxSegmentName + additionalPart;

      const {vOlds} = await rednerVirtual({
        node: <Fragment>{value}</Fragment>,
        window: clientHNode.glocalClientCtx.window,
        domPointer: getInsertDomPointer(clientHNode),
        parentHNode: clientHNode,
        vOlds: vOldsStore,
      });

      vOldsStore = vOlds;

      clientHNode.rendering = false;

      // @ts-ignore
      if (clientHNode.willUnmount === true) {
        markAsWillUnmount(clientHNode.children);
        return;
      }
    },
  });

  const {value, additionalPart} = parseAtom(atom, stage === 'render');

  jsxSegment.name += additionalPart;

  return <Fragment>{value}</Fragment>;
};
AtomWrapper[NEED_AWAIT] = true;

export {AtomWrapper};
