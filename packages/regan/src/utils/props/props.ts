import {Atom} from 'strangelove';
import {Ctx} from '../../ctx/ctx.ts';
import {AnyProps, AynFunc} from '../../types.ts';
import {prepareListenerForError} from '../../errors/utils.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {JsxNodeComponent} from '../../node/variants/component/component.ts';
import {JsxNodeElement} from '../../node/variants/element/element.ts';
import {HNode} from '../../h-node/h-node.ts';
import {SegmentEnt} from '../../segments/ent/ent.ts';
import {SegmentComponent} from '../../segments/component.ts';

type StaticProps = Record<string, any>;
type DynamicProps = Record<string, Atom>;

const createExec = ({
  name,
  element,
  // ctx,
  // jsxNode,
  atom,
  segmentEnt,
  segmentComponent,
}: {
  name: string;
  element: Element;
  segmentEnt: SegmentEnt;
  segmentComponent?: SegmentComponent;
  // ctx?: Ctx;
  // jsxNode: JsxNodeElement;
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
        segmentComponent,
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
  segmentEnt,
}: {
  tempExec: AynFunc;
  exec: AynFunc;
  hNode: HNode;
  atom: Atom;
  segmentEnt: SegmentEnt;
}) => {
  hNode.globalCtx.root.links.addExec(atom, tempExec);
  const tempUmount = () => {
    hNode.globalCtx.root.links.removeExec(atom, tempExec);
  };
  segmentEnt.unmounts.push(tempUmount);

  hNode.mounts.push((hNode) => {
    segmentEnt.unmounts = segmentEnt.unmounts.filter(
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
  segmentEnt,
  segmentComponent,
  changedAtoms,
}: {
  dynamicProps: DynamicProps;
  hNode: HNodeElement;
  segmentEnt: SegmentEnt;
  segmentComponent?: SegmentComponent;
  changedAtoms: Set<Atom>;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    subscribeAtom({
      tempExec: () => {
        changedAtoms.add(atom);
      },
      exec: createExec({
        element: hNode.element,
        name,
        segmentEnt,
        segmentComponent,
        atom,
      }),
      hNode,
      atom,
      segmentEnt,
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
