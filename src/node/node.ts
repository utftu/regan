import {ComponentCtx, NodeCtx} from '../types';
import {handleChildren} from './string/string';
import {createElementString} from './string/string.ts';

export type Child = NodeReactNext<any, any> | string;
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
    console.log('-----', 'NodeReactNextComponent');
    const streams = new TransformStream<string, string>();
    const writer = streams.writable.getWriter();

    const rawChidlren = await this.type(
      createComponentCtx({nodeCtx: ctx, props: this.props})
    );

    const children = Array.isArray(rawChidlren) ? rawChidlren : [rawChidlren];

    Promise.resolve().then(async () => {
      console.log('-----', 'resolve component');
      await handleChildren({
        children,
        ctx,
        streams,
        writer,
      });
    });

    return streams;
  }
}

export class NodeReactNextElem<TProps extends Props>
  extends NodeReactNext<string, TProps>
  implements NodeReactNext<string, TProps>
{
  async getStringStream(ctx: NodeCtx) {
    console.log('-----', 'NodeReactNextElem');
    const streams = new TransformStream<string, string>();

    const elementString = createElementString({
      type: this.type,
      props: this.props,
    });

    Promise.resolve().then(async () => {
      const writer = streams.writable.getWriter();
      console.log('-----', 'resolve elem');

      await writer.write(elementString.left);

      console.log('-----', 'resolve2 elem');
      await handleChildren({
        children: this.children,
        ctx,
        streams,
        writer,
      });
      await writer.write(elementString.right);
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

  // stream.cancel();
  return result;
}

export async function toString(node: NodeReactNext<any, any>) {
  const stream = await node.getStringStream({} as any);
  console.log('-----', 'before str');
  const str = await convertStreamToString(stream.readable);
  return str;
}
