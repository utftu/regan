import {FC, Props} from '../../../types.ts';
import {HydrateProps, HydrateResult} from '../../../hydrate/types.ts';
import {hydrateComponent} from '../../../hydrate/component.ts';
import {JsxNode, JsxNodeProps} from '../../jsx-node.ts';
import {StringifyProps, StringifyResult} from '../../../stringify/types.ts';
import {strigifyComponent} from '../../../stringify/component.ts';
import {renderComponent} from '../../../render/component.ts';
import {RenderProps, RenderResult} from '../../../render/types.ts';

export class JsxNodeComponent<
  TProps extends Props = Props
> extends JsxNode<TProps> {
  component: FC<TProps>;

  constructor(props: JsxNodeProps<TProps>, {component}: {component: FC}) {
    super(props);
    this.component = component;
  }

  stingify(props: StringifyProps): StringifyResult {
    return strigifyComponent.call(this as JsxNodeComponent, props);
  }

  hydrate(props: HydrateProps): HydrateResult {
    return hydrateComponent.call(this as JsxNodeComponent, props);
  }

  render(props: RenderProps): RenderResult {
    return renderComponent.call(this as JsxNodeComponent, props);
  }
}
