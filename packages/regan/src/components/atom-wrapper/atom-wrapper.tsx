import {Atom} from 'strangelove';
import {DomPointer, FC, FCStaticParams} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {rednerVirtual} from '../../render/render.ts';
import {checkNamedAtom} from '../../atoms/atoms.ts';
import {NEED_AWAIT} from '../../consts.ts';
import {detachChildren, unmountHNodes} from '../../h-node/helpers.ts';
import {subscribeAtom} from '../../utils/props/props.ts';
import {HNode} from '../../h-node/h-node.ts';
import {
  findPrevDomNodeHNode,
  getNearestHNodeElement,
} from '../../h-node/utils/find/node/node.ts';
import {HNodeElement} from '../../h-node/element.ts';

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

const AtomWrapper: FC<Props> & FCStaticParams = (
  {atom},
  {
    hNode,
    globalCtx,
    mount,
    unmount,
    stage,
    ctx,
    client,
    segmentEnt,
    // propsToDescendants,
  }
) => {
  const {jsxSegment} = segmentEnt;

  // toString()
  if (globalCtx.mode === 'server') {
    const {additionalPart, value} = parseAtom(atom, false);

    jsxSegment.name += additionalPart;
    return <Fragment>{value}</Fragment>;
  }

  const clientHNode = hNode!;

  let changedBeforeMount = false;
  subscribeAtom({
    tempExec: () => {
      changedBeforeMount = true;
    },
    exec: async () => {
      if (clientHNode.unmounted === true) {
        return;
      }

      detachChildren(clientHNode);

      jsxSegment.clearCache();

      const {value, additionalPart} = parseAtom(atom, false);
      jsxSegment.name = additionalPart;

      const {hNode, mountHNodes} = await rednerVirtual({
        node: <Fragment>{value}</Fragment>,
        window: clientHNode.glocalClientCtx.window,
        domPointer: getInsertDomPointer(clientHNode),
        parentHNode: clientHNode,
      });

      mountHNodes();
    },
    hNode: clientHNode,
    atom,
  });

  // let changedBeforeMount = false;
  const tempExec = () => {
    changedBeforeMount = true;
    globalCtx.root.links.removeExec(atom, tempExec);
  };
  globalCtx.root.links.addExec(atom, tempExec);

  mount(() => {});

  const exec = async () => {
    if (clientHNode.unmounted === true) {
      return;
    }

    clientHNode.children.forEach((hNodeChild) => {
      unmountHNodes(hNodeChild);
      hNodeChild.parent = undefined;
    });
    clientHNode.children.length = 0;

    const {value, additionalPart} = parseAtom(atom, false);

    jsxSegment.clearCache();
    jsxSegment.name = (jsxSegment.parent?.position || '') + additionalPart;

    const {hNode, mountHNodes} = await rednerVirtual({
      node: <Fragment>{value}</Fragment>,
      window: clientHNode.glocalClientCtx.window,
      domPointer: client!.parentDomPointer,
      parentCtx: ctx.parentCtx,
      parentHNode: hNode,
    });

    childMount();
  };

  mount(() => {
    globalCtx.root.links.replaceExec(atom, tempExec, exec);

    if (changedBeforeMount === true) {
      exec();
    }

    const a = convertHydatedToVirtualSingle(hNode!);
  });
  unmount(() => {
    globalCtx.root.links.removeExec(atom, exec);
  });

  const {value, additionalPart} = parseAtom(atom, stage === 'render');

  jsxSegment.name += additionalPart;

  return <Fragment>{value}</Fragment>;
};
AtomWrapper[NEED_AWAIT] = true;

export {AtomWrapper};
