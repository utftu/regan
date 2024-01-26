import {Child, Props, SystemProps} from '../types.ts';
import {HNode} from '../h-node/h-node.ts';
import {RenderProps} from './render/render.ts';
import {HydrateProps} from './hydrate/hydrate.ts';
import {GetStringStreamProps} from './string/string.ts';

export type DomSimpleProps = {
  parent: HTMLElement;
};

export type DomProps = DomSimpleProps & {
  position: number;
};

// type ConnectElements = () => HTMLElement[][];

// export type ConnectElementRender = (
//   cb: (children: (ConnectElementElements | string)[]) => void
// ) => void;
// export type ConnectElementElements = () => HTMLElement[];
export type ConnectElements = () => (HTMLElement | string)[];

export abstract class JSXNode<TType = any, TProps extends Props = any> {
  type: TType;

  props: TProps;
  systemProps: SystemProps;
  children: Child[];

  constructor({
    type,
    props,
    children,
    systemProps = {},
  }: {
    type: TType;
    props: TProps;
    children: Child[];
    systemProps?: SystemProps;
  }) {
    this.type = type;
    this.props = props;
    this.children = children;
    this.systemProps = systemProps;
  }
  abstract getStringStream(
    ctx: GetStringStreamProps
  ): Promise<ReadableStream<string>>;
  abstract hydrate(
    ctx: HydrateProps
  ): Promise<{insertedCount: number; hNode: HNode}>;
  abstract render(ctx: RenderProps): Promise<{
    hNode: HNode;
    connectElements: ConnectElements;
  }>;
}
