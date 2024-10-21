import {Atom} from 'strangelove';
import {Ctx} from '../../ctx/ctx.ts';
import {AnyProps, AynFunc} from '../../types.ts';
import {prepareListenerForError} from '../../errors/utils.ts';
import {HNodeElement} from '../../h-node/element.ts';
import {JsxNodeComponent} from '../../node/variants/component/component.ts';
import {JsxNodeElement} from '../../node/variants/element/element.ts';
import {HNode} from '../../h-node/h-node.ts';

type StaticProps = Record<string, any>;
type DynamicProps = Record<string, Atom>;

const createExec = ({
  name,
  element,
  ctx,
  jsxNode,
  atom,
}: {
  name: string;
  element: HTMLElement;
  ctx?: Ctx;
  jsxNode: JsxNodeElement;
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
        ctx,
        jsxNode,
      });

      element.addEventListener(name, listener);
      item.listener = listener;
    } else {
      element.setAttribute(name, value);
    }
  };
  return exec;
};

const subscribeWithAutoRemove = ({
  hNode,
  listener,
  atom,
}: {
  atom: Atom;
  listener: AynFunc;
  hNode: HNode;
}) => {
  hNode.mounts.push(() => {
    hNode.globalCtx.root.links.addExec(atom, listener);
    hNode.unmounts.push(() => {
      hNode.globalCtx.root.links.addExec(atom, listener);
    });
  });
};

export const initDynamicSubsribes = ({
  dynamicProps,
  hNode,
  changedAtoms,
  ctx,
  jsxNode,
}: {
  dynamicProps: DynamicProps;
  hNode: HNodeElement;
  changedAtoms: Atom[];
  ctx?: Ctx;
  jsxNode: JsxNodeElement;
}) => {
  for (const name in dynamicProps) {
    const atom = dynamicProps[name];

    const execTemp = () => {
      changedAtoms.push(atom);
    };

    hNode.globalCtx.root.links.addExec(atom, execTemp);

    const exec = createExec({element: hNode.element, name, ctx, jsxNode, atom});

    hNode.mounts.push((hNode) => {
      hNode.globalCtx.root.links.replaceExec(atom, execTemp, exec);

      hNode.unmounts.push(() => {
        hNode.globalCtx.root.links.removeExec(atom, exec);
      });
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
