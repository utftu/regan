import {Atom} from 'strangelove';
import {Ctx, NodeCtx} from '../types.ts';
import {ElementNode, handleChildrenHydrate} from './hydrate/hydrate.ts';
import {handleChildren} from './string/string.ts';
import {createElementString} from './string/string.ts';

export type Child = JSXNode<any, any> | string;
export type Props = Record<string, any>;

// type ConstructorProps<T> = T extends {new (...args: any[]): infer U}
//   ? U
//   : never;
// type A = ConstructorProps<typeof Atom>;

function normalizeChildren(child: Child | Child[]) {
  if (Array.isArray(child)) {
    return child;
  }
  return [child];
}

// class AtomRegan<TValue> extends Atom<TValue> {
//   constructor(
//     props: ConstructorParameters<typeof Atom<TValue>>[0] & {desytroy: any}
//   ) {
//     super(props);
//   }

//   // constructor(props: ConstructorParameters<typeof AtomRegan>) {}
// }

export type FC<TProps = any> = (
  ctx: Ctx<TProps>
) => JSXNode | JSXNode[] | Promise<JSXNode> | Promise<JSXNode[]>;

function createComponentCtx<TProps>({
  nodeCtx,
  props,
}: {
  nodeCtx: NodeCtx;
  props: TProps;
}): Ctx<TProps> {
  return {
    props,
    mount: () => {},
    select: () => {},
    children: [],
    // config: {
    //   disableSubscribe: boolean,
    // },
  };
}

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
    parent: ElementNode;
    position: number;
  }): Promise<{insertedCount: number}>;
}

export class JSXNodeComponent<TProps extends Props>
  extends JSXNode<FC<TProps>, TProps>
  implements JSXNode<FC<TProps>, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();

    const rawChidlren = await this.type(
      createComponentCtx({nodeCtx: ctx, props: this.props})
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

  async hydrate(ctx: {parent: ElementNode; position: number}) {
    const rawChidlren = await this.type(
      createComponentCtx({nodeCtx: ctx, props: this.props})
    );

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

  async hydrate(ctx: {parent: ElementNode; position: number}) {
    const element = ctx.parent.element.children[ctx.position] as HTMLElement;

    for (const key in this.props) {
      const prop = this.props[key];

      if (typeof prop !== 'function') {
        continue;
      }

      element.addEventListener(key, prop);
    }

    const elementNode = new ElementNode({element});

    await handleChildrenHydrate({children: this.children, parent: elementNode});

    return {insertedCount: 1};
  }
}

class MyClass {
  constructor(public name: string, public age: number) {}
}

type MyClassConstructorArgs = ConstructorParameters<typeof MyClass>;

// Теперь вы можете использовать MyClassConstructorArgs для определения переменных, функций и т.д.
const args: MyClassConstructorArgs = ['John', 30];

// Создание экземпляра класса с использованием аргументов
const myInstance = new MyClass(...args);
