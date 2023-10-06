import {handleChildrenHydrate} from './hydrate/hydrate.ts';
import {handleChildren} from './string/string.ts';
import {createElementString} from './string/string.ts';
import {Ctx} from './ctx/ctx.ts';
import {normalizeChildren} from '../jsx/jsx.ts';
import {NodeCtx} from '../types.ts';
import {HydratedNode} from './hydrate/hydrate.ts';
import {Fragment} from '../components/fragment/fragment.ts';
import {Atom, disconnectAtoms} from 'strangelove';

export type Child = JSXNode<any, any> | string | null | undefined;
export type Props = Record<string, any>;

// function normalizeChildren(child: Child | Child[]) {
//   if (Array.isArray(child)) {
//     return child;
//   }
//   return [child];
// }

export type DomProps = {
  parent: HTMLElement;
  position: number;
};

export type FC<TProps extends Record<any, any>> = (
  props: TProps,
  ctx: Ctx<TProps>
) => JSXNode | JSXNode[] | Promise<JSXNode> | Promise<JSXNode[]>;

export abstract class JSXNode<TType = any, TProps extends Props = any> {
  type: TType;
  key: string;
  props: TProps;
  children: Child[];

  constructor({
    type,
    props,
    key = '',
    children,
  }: {
    type: TType;
    props: TProps;
    key: string;
    children: Child[];
  }) {
    this.type = type;
    this.key = key;
    this.props = props;
    this.children = children;
  }
  abstract getStringStream(ctx: NodeCtx): Promise<ReadableStream<string>>;
  abstract hydrate(ctx: {
    dom: DomProps;
    parentHydratedNode?: HydratedNode;
  }): Promise<{insertedCount: number; hydratedNode: HydratedNode}>;
}

function destroyAtom(atom: Atom) {
  for (const parent of atom.relations.parents) {
    disconnectAtoms(parent, atom);
  }
  atom.transaction = {};
}

export class JSXNodeComponent<TProps extends Props>
  extends JSXNode<FC<TProps>, TProps>
  implements JSXNode<FC<TProps>, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();

    const state = {
      mounts: [],
      atoms: [],
    };
    const rawChidlren = await this.type(
      this.props,
      new Ctx({
        props: this.props,
        state: state,
        children: this.children,
      })
    );

    const children = normalizeChildren(rawChidlren);

    Promise.resolve().then(async () => {
      await handleChildren({
        children,
        ctx,
        streams,
      });
      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: {dom: DomProps; parentHydratedNode?: HydratedNode}) {
    const state = {
      mounts: [],
      atoms: [],
    };
    const componentCtx = new Ctx({
      props: this.props,
      state: state,
      children: this.children,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const hydratedNode = new HydratedNode({
      mount: () => {
        const unmounts = componentCtx.state.mounts.map((mount) => mount());

        return () => {
          unmounts.forEach((possibleUnmount) => {
            if (typeof possibleUnmount === 'function') {
              possibleUnmount();
            }
          });
          componentCtx.state.atoms.forEach((possibleAtom) => {
            if (possibleAtom instanceof Promise) {
              possibleAtom.then((atom) => destroyAtom(atom));
            } else {
              destroyAtom(possibleAtom);
            }
          });
        };
      },
      parent: ctx.parentHydratedNode,
    });

    const {insertedCount, hydratedNodes: childrenHydrayedNodes} =
      await handleChildrenHydrate({
        parentElement: ctx.dom.parent,
        parentHydratedNode: hydratedNode,
        children,
        // todo
        insertedCountStart: ctx.dom.position,
      });

    hydratedNode.addChildren(childrenHydrayedNodes);

    return {insertedCount, hydratedNode};
  }
}

export class JSXNodeElement<TProps extends Props>
  extends JSXNode<string, TProps>
  implements JSXNode<string, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();

    const elementString = createElementString({
      type: this.type,
      props: this.props,
    });

    Promise.resolve().then(async () => {
      const writer = streams.writable.getWriter();

      await writer.write(elementString.left);
      writer.releaseLock();

      await handleChildren({
        children: this.children,
        ctx,
        streams,
      });

      const writer2 = streams.writable.getWriter();
      await writer2.write(elementString.right);
      writer2.releaseLock();

      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: {dom: DomProps; parentHydratedNode?: HydratedNode}) {
    const element = ctx.dom.parent.children[ctx.dom.position] as HTMLElement;

    for (const key in this.props) {
      const prop = this.props[key];

      if (typeof prop !== 'function') {
        continue;
      }

      // todo get atom

      element.addEventListener(key, prop);
    }

    const hydratedNode = new HydratedNode({
      mount: () => {
        return () => {
          element.remove();
        };
      },
      parent: ctx.parentHydratedNode,
    });

    const {hydratedNodes} = await handleChildrenHydrate({
      children: this.children,
      parentElement: element,
      // todo
      parentHydratedNode: hydratedNode,
    });

    hydratedNode.addChildren(hydratedNodes);

    return {insertedCount: 1, hydratedNode};
  }
}
