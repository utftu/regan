import {NodeCtx} from '../types.ts';
import {handleChildrenHydrate} from './hydrate/hydrate.ts';
import {handleChildren} from './string/string.ts';
import {createElementString} from './string/string.ts';
import {Ctx} from './ctx/ctx.ts';
import {Atom} from 'strangelove';
import {normalizeChildren} from '../jsx/jsx.ts';

export type Child = JSXNode<any, any> | string | null | undefined;
export type Props = Record<string, any>;

// function normalizeChildren(child: Child | Child[]) {
//   if (Array.isArray(child)) {
//     return child;
//   }
//   return [child];
// }

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
    parent: HTMLElement;
    position: number;
  }): Promise<{insertedCount: number}>;
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

  async hydrate(ctx: {parent: HTMLElement; position: number}) {
    const state = {
      mounts: [],
      atoms: [],
    };
    const componentCtx = new Ctx({
      props: this.props,
      state: state,
    });
    const rawChidlren = await this.type(this.props, componentCtx);

    const children = normalizeChildren(rawChidlren);

    const insertedCount = await handleChildrenHydrate({
      parent: ctx.parent,
      children,
    });

    return {insertedCount};
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
      await writer.releaseLock();

      await handleChildren({
        children: this.children,
        ctx,
        streams,
      });

      const writer2 = streams.writable.getWriter();
      await writer2.write(elementString.right);
      await writer2.releaseLock();

      await streams.writable.close();
    });

    return streams.readable;
  }

  async hydrate(ctx: {parent: HTMLElement; position: number}) {
    const element = ctx.parent.children[ctx.position] as HTMLElement;

    for (const key in this.props) {
      const prop = this.props[key];

      if (typeof prop !== 'function') {
        continue;
      }

      element.addEventListener(key, prop);
    }

    await handleChildrenHydrate({children: this.children, parent});

    return {insertedCount: 1};
  }
}

abstract class HydratedNode {
  abstract atom: Atom;
  abstract destroy(): void;
}
