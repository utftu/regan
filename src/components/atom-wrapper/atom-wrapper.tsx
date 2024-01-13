import {Atom} from 'strangelove';
import {ElementPointer, FC} from '../../types.ts';
import {Fragment} from '../fragment/fragment.ts';
import {unmountHNodes} from '../../h-node/h-node.ts';
import {rednerRaw} from '../../render/render.ts';
import {
  findParentElement,
  findPrevElement,
} from '../../h-node/helpers/elements.ts';
import {checkNamedAtom} from '../../atoms/atoms.ts';

type Props = {
  atom: Atom;
};

const parseAtom = (atom: Atom, initRendrering: boolean) => {
  let additionalPart = '?a=';
  let value;
  if (checkNamedAtom(atom)) {
    const {name, value: localValue} = atom.get();
    value = localValue;
    additionalPart = name;
  } else {
    value = atom.get();

    if (initRendrering) {
      additionalPart += Date.now();
    } else {
      additionalPart += '0';
    }
  }

  return {value, additionalPart};
};
// todo
export const AtomWrapper: FC<Props> = (
  {atom},
  {hNode, globalCtx, mount, unmount, stage, jsxSegment}
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

    if (clientHNode.unmounted === true) {
      return;
    }

    const {value, additionalPart} = parseAtom(atom, true);

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

  const {value, additionalPart} = parseAtom(atom, stage === 'render');

  jsxSegment.clearCache();
  jsxSegment.segment += additionalPart;

  return <Fragment>{value}</Fragment>;
};
