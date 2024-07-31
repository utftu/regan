import {Child, Props, SystemProps} from '../types.ts';
import {RenderProps, RenderResult} from './render/render.ts';
import {HydrateProps, HydrateResult} from './hydrate/hydrate.ts';
import {GetStringStreamProps} from './string/string.ts';

export type StringResult = Promise<ReadableStream<string>>;

export abstract class JsxNode<
  TType = any,
  TProps extends Props = Record<string, any>
> {
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
