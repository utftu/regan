import {Child, Props, SystemProps} from '../types.ts';
import {RenderProps, RenderResult} from '../render/types.ts';
import {HydrateProps, HydrateResult} from '../hydrate/types.ts';
import {GetStringStreamProps} from '../string/types.ts';

export abstract class JsxNode<
  TType = any,
  TProps extends Props = Record<string, any>
> {
  type: string;
  // type: TType;

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
  abstract stingify(ctx: GetStringStreamProps): string;
  abstract hydrate(ctx: HydrateProps): HydrateResult;
  abstract render(ctx: RenderProps): RenderResult;
}
