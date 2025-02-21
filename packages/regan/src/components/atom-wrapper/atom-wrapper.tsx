import {Atom} from 'strangelove';
import {FC, FCStaticParams} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {rednerVirtual} from '../../render/render.ts';
import {NEED_AWAIT} from '../../consts.ts';
import {detachChildren} from '../../h-node/helpers.ts';
import {VOld} from '../../v/types.ts';
import {AtomWrapperData, HNodeComponent} from '../../h-node/component.ts';
import {getInsertDomPointer, markAsWillUnmount, parseAtom} from './helpers.ts';
import {subscribeAtomWrapper} from './subsribe.ts';
import {convertHNodesToVOls} from './hnode-to-vold.ts';

type Props = {
  atom: Atom;
};

const AtomWrapper: FC<Props> & FCStaticParams = (
  {atom},
  {globalCtx, stage, client, segmentEnt}
) => {
  const {pathSegment: jsxSegment} = segmentEnt;
  const initJsxSegmentName = jsxSegment.name;

  // toString()
  if (globalCtx.mode === 'server') {
    const {additionalPart, value} = parseAtom(atom, false);

    jsxSegment.name += additionalPart;
    return <Fragment>{value}</Fragment>;
  }

  const clientHNode = client!.hNode as HNodeComponent;
  const atomWrapperData = new AtomWrapperData({atom, hNode: clientHNode});

  clientHNode.data.atomWrapperData = atomWrapperData;

  let vOldsStore: VOld[] | undefined;

  subscribeAtomWrapper({
    atomWrapperData,
    exec: async () => {
      if (clientHNode.unmounted === true) {
        return;
      }

      if (atomWrapperData.willUnmount === true) {
        return;
      }

      if (!vOldsStore) {
        const vOlds = convertHNodesToVOls(clientHNode, {});
        vOldsStore = vOlds;
      }

      atomWrapperData.rendering = true;

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

      atomWrapperData.rendering = false;

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

export {AtomWrapper as AtomWrapper};
