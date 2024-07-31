import {Atom} from 'strangelove';
import {HNode} from '../../h-node/h-node.ts';
import {Exec} from '../../root/links/links.ts';
import {GlobalCtx} from '../../global-ctx/global-ctx.ts';
import {JsxNodeElement} from '../../node/variants/element/element.ts';
import {Ctx} from '../../ctx/ctx.ts';
import {prepareListener} from '../errors.ts';
import {noop} from '../../consts.ts';

type AnyFunc = (...args: any[]) => any;
type StaticProps = Record<string, any>;
type DynamicProps = Record<string, Atom>;

type DynamicPropProps = {
  exec: Exec;
  element: HTMLElement;
  listener?: any;
  atom: Atom;
  globalCtx: GlobalCtx;
};

class DynamicProp implements DynamicPropProps {
  exec: Exec;
  element: HTMLElement;
  listener?: any;
  atom: Atom;
  globalCtx: GlobalCtx;

  detach() {
    this.globalCtx.root.links.removeExec(this.atom, this.exec);
  }

  constructor({exec, element, listener, atom, globalCtx}: DynamicPropProps) {
    this.exec = exec;
    this.element = element;
    this.atom = atom;
    this.listener = listener;
    this.globalCtx = globalCtx;
  }
}

export type DynamicPropsEnt = Record<string, DynamicProp>;

export const detachDynamicProps = (dynamicProps: DynamicPropsEnt) => {
  for (const name in dynamicProps) {
    dynamicProps[name].detach();
  }
};

export const initDynamicProps = ({
  dynamicPropsEnt,
  hNode,
  globalCtx,
  changedAtoms,
}: {
  dynamicPropsEnt: DynamicPropsEnt;
  hNode: HNode;
  changedAtoms: Atom[];
  globalCtx: GlobalCtx;
}) => {
  for (const name in dynamicPropsEnt) {
    const prop = dynamicPropsEnt[name];
    const atom = prop.atom;

    const execTemp = () => {
      changedAtoms.push(atom);
    };

    globalCtx.root.links.addExec(atom, execTemp);

    hNode.mounts.push(() => {
      globalCtx.root.links.replaceExec(atom, execTemp, prop.exec);
    });
  }
};

export const prepareDynamicProps = ({
  props,
  jsxNode,
  ctx,
  element,
  globalCtx,
}: {
  props: DynamicProps;
  jsxNode: JsxNodeElement;
  ctx?: Ctx;
  element: HTMLElement;
  globalCtx: GlobalCtx;
}) => {
  const dynamicPropsEnt: DynamicPropsEnt = {};
  for (const name in props) {
    const prop = props[name] as any;

    const item = new DynamicProp({
      element,
      atom: prop,
      globalCtx,
      exec: noop,
    });

    dynamicPropsEnt[name] = item;

    const exec = (value: any) => {
      if (item.listener) {
        item.element.removeEventListener(name, item.listener);
        delete item.listener;
      }

      if (typeof value === 'function') {
        const listener = prepareListener({
          listener: value,
          ctx: ctx,
          jsxNode,
        });

        item.element.addEventListener(name, listener);
        item.listener = listener;
      } else {
        item.element.setAttribute(name, value);
      }
    };
    item.exec = exec;
  }
  return dynamicPropsEnt;
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

export const handleProps = ({props}: {props: Record<string, any>}) => {
  const dynamicProps: Record<string, Atom> = {};
  const staticProps: Record<string, any> = {};
  for (const name in props) {
    const prop = props[name] as any;

    if (prop instanceof Atom) {
      dynamicProps[name] = prop;
    } else {
      staticProps[name] = prop;
    }
  }

  return {dynamicProps, staticProps};
};

// export const handleProps = ({
//   props,
//   jsxNode,
//   ctx,
//   element,
//   globalCtx,
// }: {
//   props: Record<string, any>;
//   jsxNode: JsxNodeElement;
//   ctx?: Ctx;
//   element: HTMLElement;
//   globalCtx: GlobalCtx;
// }) => {
//   const dynamicProps: DynamicProps = {};
//   const staticProps: Record<string, any> = {};
//   for (const name in props) {
//     const prop = props[name] as any;

//     // atom
//     if (prop instanceof Atom) {
//       const item = new DynamicProp({
//         element,
//         atom: prop,
//         globalCtx,
//         exec: noop,
//       });

//       dynamicProps[name] = item;

//       const exec = (value: any) => {
//         if (item.listener) {
//           item.element.removeEventListener(name, item.listener);
//           delete item.listener;
//         }

//         if (typeof value === 'function') {
//           const listener = prepareListener({
//             listener: value,
//             ctx: ctx,
//             jsxNode,
//           });

//           item.element.addEventListener(name, listener);
//           item.listener = listener;
//         } else {
//           item.element.setAttribute(name, value);
//         }
//       };
//       item.exec = exec;
//     } else {
//       staticProps[name] = prop;
//     }

//     // // usual value
//     // element.setAttribute(name, prop);
//   }

//   return {dynamicProps, staticProps};
// };
