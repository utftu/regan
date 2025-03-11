import {Child, Props, SystemProps} from '../types.ts';
import {HydrateProps, HydrateResult} from '../hydrate/types.ts';
import {StringifyProps} from '../string/types.ts';

export type JsxNodeProps<TProps extends Props = Props> = {
  props: TProps;
  children: Child[];
  systemProps?: SystemProps;
};

export abstract class JsxNode<TProps extends Props = Props> {
  props: TProps;
  systemProps: SystemProps;
  children: Child[];

  constructor({props, children, systemProps = {}}: JsxNodeProps<TProps>) {
    this.props = props;
    this.children = children;
    this.systemProps = systemProps;
  }
  // abstract stingify(props: StringifyProps): string;
  abstract hydrate(ctx: HydrateProps): HydrateResult;
  // abstract render(ctx: RenderProps): RenderResult;
}
