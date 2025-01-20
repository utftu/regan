import {Atom} from 'strangelove';
import {DomPointer, FC, FCStaticParams} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {rednerVirtual} from '../../render/render.ts';
import {checkNamedAtom} from '../../atoms/atoms.ts';
import {NEED_AWAIT} from '../../consts.ts';
import {detachChildren, unmountHNodes} from '../../h-node/helpers.ts';
import {HNode} from '../../h-node/h-node.ts';
import {
  findPrevDomNodeHNode,
  getNearestHNodeElement,
} from '../../h-node/utils/find/node/node.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {subscribeAtom} from '../../utils/props/atom.ts';
import {VOld} from '../../v/types.ts';
import {HNodeAtomWrapper} from '../../h-node/component.ts';
import {Tx} from '../../root/tx/tx.ts';

type Props = {
  atom: Atom;
};

const getInsertDomPointer = (hNode: HNode): DomPointer => {
  const {prevNode, lastParentHNode} = findPrevDomNodeHNode(hNode);

  if (prevNode && prevNode.parentNode) {
    return {
      parent: prevNode.parentNode,
      nodeCount: Array.prototype.indexOf.call(
        prevNode.parentNode.childNodes,
        prevNode
      ),
    };
  } else if (lastParentHNode instanceof HNodeElement) {
    return {
      parent: lastParentHNode.element,
      nodeCount: 0,
    };
  } else {
    const findedNearestHNodeElement = getNearestHNodeElement(lastParentHNode);
    if (findedNearestHNodeElement) {
      return {
        parent: findedNearestHNodeElement.element,
        nodeCount: 0,
      };
    } else {
      return {
        parent: hNode.glocalClientCtx.initDomPointer.parent,
        nodeCount: hNode.glocalClientCtx.initDomPointer.nodeCount,
      };
    }
  }
};

const parseAtom = (atom: Atom, renderMode: boolean = false) => {
  let additionalPart = '?a=';
  let value;
  if (checkNamedAtom(atom)) {
    const {name, value: localValue} = atom.get();
    value = localValue;
    additionalPart += name;
  } else {
    value = atom.get();

    if (renderMode) {
      additionalPart += Date.now();
    } else {
      additionalPart += '0';
    }
  }

  return {value, additionalPart};
};

const init = (hNode: HNode) => {
  const atoms = collectAtoms(hNode, []);

  const tx = new Tx();
};

const collectAtoms = (hNode: HNode, atoms: Atom[]) => {
  if (hNode instanceof HNodeAtomWrapper) {
    atoms.push(hNode.atom);
  }

  hNode.children.forEach((child) => {
    collectAtoms(child, atoms);
  });

  return atoms;
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

  const clientHNode = hNode!;

  let vOldsStore: VOld[] | undefined = [];
  subscribeAtom({
    exec: async () => {
      //

      //
      if (clientHNode.unmounted === true) {
        return;
      }

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
    },
    hNode: clientHNode,
    atom,
  });

  const {value, additionalPart} = parseAtom(atom, stage === 'render');

  jsxSegment.name += additionalPart;

  return <Fragment>{value}</Fragment>;
};
AtomWrapper[NEED_AWAIT] = true;

export {AtomWrapper};
