import {Atom} from 'strangelove';
import {ElementPointer, FC, FCStaticParams} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {unmountHNodes} from '../../h-node/h-node.ts';
import {rednerRaw} from '../../render/render.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';
import {checkNamedAtom} from '../../atoms/atoms.ts';
import {NEED_AWAIT} from '../../consts.ts';

type Props = {
  atom: Atom;
};

const parseAtom = (atom: Atom, renderMode: boolean = false) => {
  let additionalPart = '?a=';
  let value;
  if (checkNamedAtom(atom)) {
    const {name, value: localValue} = atom.get();
    value = localValue;
    additionalPart = name;
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
  {hNode, systemProps, globalCtx, mount, unmount, stage, jsxSegment, ctx}
) => {
  systemProps.needAwait = true;
  if (globalCtx.mode === 'server') {
    const {additionalPart, value} = parseAtom(atom, false);

    // todo
    // jsxSegment.clearCache();
    jsxSegment.segment += additionalPart;
    return <Fragment>{value}</Fragment>;
  }
  const clientHNode = hNode!;

  let changedBeforeMount = false;
  const tempExec = () => {
    changedBeforeMount = true;
  };
  globalCtx.root.links.addExec(atom, tempExec);
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
    jsxSegment.segment = (jsxSegment.parent?.position || '') + additionalPart;

    const {mount: childMount} = await rednerRaw({
      node: <Fragment>{value}</Fragment>,
      window: clientHNode.hNodeCtx.window,
      getElemPointer() {
        const parent = findParentElement(clientHNode);

        if (!parent) {
          return clientHNode.hNodeCtx.getInitElemPointer();
        }

        const prev = findPrevElement(clientHNode);

        console.log('-----', '12', {
          parent,
          prev,
        });

        return {
          parent,
          prev,
        } as ElementPointer;
      },
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
  });
  unmount(() => {
    globalCtx.root.links.removeExec(atom, exec);
  });

  const {value, additionalPart} = parseAtom(atom, stage === 'render');

  // jsxSegment.clearCache();
  jsxSegment.segment += additionalPart;

  return <Fragment>{value}</Fragment>;
};
AtomWrapper[NEED_AWAIT] = true;

export {AtomWrapper};
