import {FC, Props} from '../../../types.ts';
import {HydrateProps} from '../../../hydrate/types.ts';
import {hydrateComponent} from '../../../hydrate/component.ts';
import {JsxNode, JsxNodeProps} from '../../jsx-node.ts';

export class JsxNodeComponent<
  TProps extends Props = Props
> extends JsxNode<TProps> {
  component: FC<TProps>;

  constructor(props: JsxNodeProps<TProps>, {component}: {component: FC}) {
    super(props);
    this.component = component;
  }

  hydrate(ctx: HydrateProps) {
    // cant pass genetic in call
    return hydrateComponent.call(this as JsxNodeComponent, ctx);
  }
}
