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

export type ConnectElements = () => (HTMLElement | string)[];

export type RenderResult = Promise<{
  hNode: HNode;
  insertedDomCount: number;
  connectElements: ConnectElements;
}>;

export type HydrateResult = Promise<{insertedCount: number; hNode: HNode}>;

export type StringResult = Promise<ReadableStream<string>>;

export abstract class JsxNode<TType = any, TProps extends Props = any> {
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
  abstract getStringStream(ctx: GetStringStreamProps): StringResult;
  abstract hydrate(ctx: HydrateProps): HydrateResult;
  abstract render(ctx: RenderProps): RenderResult;
}
