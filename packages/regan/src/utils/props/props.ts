import {Atom} from 'strangelove';
import {AynFunc} from '../../types.ts';
import {prepareListenerForError} from '../../errors/utils.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {SegmentEnt} from '../../segments/ent/ent.ts';
import {ContextEnt} from '../../context/context.tsx';

type StaticProps = Record<string, any>;
type DynamicProps = Record<string, Atom>;

const createExec = ({
  name,
  element,
  atom,
  segmentEnt,
  contextEnt,
}: {
  name: string;
  element: Element;
  segmentEnt: SegmentEnt;
  contextEnt?: ContextEnt;
  atom: Atom;
}) => {
  const item: {listener?: AynFunc} = {};
  if (typeof atom.get() === 'function') {
    item.listener = atom.get();
  }

  const exec = (value: any) => {
    if (item.listener) {
      element.removeEventListener(name, item.listener);
      delete item.listener;
    }

    if (typeof value === 'function') {
      const listener = prepareListenerForError({
        listener: value,
        segmentEnt,
        contextEnt,
      });

      element.addEventListener(name, listener);
      item.listener = listener;
    } else {
      element.setAttribute(name, value);
    }
  };
  return exec;
};

export const subscribeAtom = ({
  tempExec,
  exec,
  hNode,
  atom,
}: {
  tempExec: AynFunc;
  exec: AynFunc;
  hNode: HNode;
  atom: Atom;
}) => {
  hNode.globalCtx.root.links.addExec(atom, tempExec);
  const tempUmount = () => {
    hNode.globalCtx.root.links.removeExec(atom, tempExec);
  };
  hNode.segmentEnt.unmounts.push(tempUmount);

  hNode.mounts.push((hNode) => {
    hNode.segmentEnt.unmounts = hNode.segmentEnt.unmounts.filter(
      (item) => item !== tempUmount
    );
    hNode.globalCtx.root.links.replaceExec(atom, tempExec, exec);

    hNode.unmounts.push(() => {
      hNode.globalCtx.root.links.removeExec(atom, exec);
    });
  });
};

export const initDynamicSubsribes = ({
  dynamicProps,
  hNode,
}: // changedAtoms,
{
  dynamicProps: DynamicProps;
  hNode: HNodeElement;
  // changedAtoms: Set<Atom>;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    subscribeAtom({
      tempExec: () => {
        // changedAtoms.add(atom);
      },
      exec: createExec({
        element: hNode.element,
        name,
        segmentEnt: hNode.segmentEnt,
        contextEnt: hNode.contextEnt,
        atom,
      }),
      hNode,
      atom,
    });
  }
};

export const initStaticProps = (
  element: HTMLElement,
  staticProps: StaticProps
) => {
  for (const name in staticProps) {
    const value = staticProps[name];

    if (typeof value === 'function') {
      element.addEventListener(name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
};
