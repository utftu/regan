import {ComponentCtx, NodeCtx} from '../types.ts';
import {handleChildren} from './string/string.ts';
import {createElementString} from './string/string.ts';

export type Child = ReganJSXNode<any, any> | string;
type Props = Record<string, any>;

export type Component<TProps> = (ctx: ComponentCtx<TProps>) => any;

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

export abstract class ReganJSXNode<TType, TProps extends Props> {
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

export class ReganJSXNodeComponent<TProps extends Props>
  extends ReganJSXNode<Component<TProps>, TProps>
  implements ReganJSXNode<Component<TProps>, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    const streams = new TransformStream<string, string>();

    const rawChidlren = await this.type(
      createComponentCtx({nodeCtx: ctx, props: this.props})
    );

    const children = Array.isArray(rawChidlren) ? rawChidlren : [rawChidlren];

    Promise.resolve().then(async () => {
      await handleChildren({
        children,
        ctx,
        streams,
      });
      await streams.writable.close();
    });

    return streams;
  }
}

export class ReganJSXNodeElement<TProps extends Props>
  extends ReganJSXNode<string, TProps>
  implements ReganJSXNode<string, TProps>
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

    return streams;
  }
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

export async function toString(node: ReganJSXNode<any, any>) {
  const stream = await node.getStringStream({} as any);
  const str = await convertStreamToString(stream.readable);
  return str;
}
