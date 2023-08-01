import {ComponentCtx, NodeCtx} from '../types';
import {handleChildren} from './string/string';
import {createElementString} from './string/string.ts';

export type Child = NodeReactNext<any, any> | string;
type Props = Record<string, any>;

type Component<TProps> = (ctx: ComponentCtx<TProps>) => any;

function createComponentCtx<TProps>({
  nodeCtx,
  props,
}: {
  nodeCtx: NodeCtx;
  props: TProps;
}): ComponentCtx<TProps> {
  return {
    props,
    mount: () => {},
    select: () => {},
    // config: {
    //   disableSubscribe: boolean,
    // },
  };
}

abstract class NodeReactNext<TType, TProps extends Props> {
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
  abstract getStringStream(
    ctx: NodeCtx
  ): Promise<TransformStream<string, string>>;
}

export class NodeReactNextComponent<TProps extends Props>
  extends NodeReactNext<Component<TProps>, TProps>
  implements NodeReactNext<Component<TProps>, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();
    const writer = streams.writable.getWriter();

    const element = await this.type(
      createComponentCtx({nodeCtx: ctx, props: this.props})
    );

    const elementString = createElementString({
      type: element,
      props: this.props,
    });
    writer.write(elementString.left);

    Promise.resolve().then(async () => {
      await handleChildren({
        children: this.children,
        ctx,
        streams,
        writer,
      });
      writer.write(elementString.right);
      writer.close();
    });

    return streams;
  }
}

export class NodeReactNextElem<TProps extends Props>
  extends NodeReactNext<string, TProps>
  implements NodeReactNext<string, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();
    const writer = streams.writable.getWriter();

    const elementString = createElementString({
      type: this.type,
      props: this.props,
    });
    writer.write(elementString.left);

    Promise.resolve().then(async () => {
      await handleChildren({
        children: this.children,
        ctx,
        streams,
        writer,
      });
      writer.write(elementString.right);
      writer.close();
    });

    return streams;
  }
}

export function jsx<TProps extends Props>(
  type: string | Component<any>,
  rawProps: {children: Child | Child[]} & TProps,
  key: string
) {
  const {children: rawChidlren, ...props} = rawProps;
  const children = Array.isArray(rawChidlren) ? rawChidlren : [rawChidlren];
  if (typeof type === 'string') {
    return new NodeReactNextElem({type, props, key, children});
  }
  return new NodeReactNextComponent({type, props, key, children});
}

async function convertStreamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  let result = '';

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    result += value;
  }

  return result;
}

async function toString(node: NodeReactNext<any, any>) {
  const stream = await node.getStringStream({} as any);
  const str = await convertStreamToString(stream.readable);
  return str;
}

const a = jsx('div', {a: 'b', children: []}, '2');

const b = await toString(a);

console.log('-----', 'b', b);
