import {JsxNode} from '../node.ts';
import {getStringStreamComponent} from '../../string/component.ts';
import {hydrateComponent} from '../../hydrate/component.ts';
import {renderComponent} from '../../render/component.ts';
import {GetStringStreamProps} from '../string/string.ts';
import {HydrateProps} from '../hydrate/hydrate.ts';
import {RenderProps} from '../render/render.ts';
import {FC} from '../../types.ts';

export class JsxNodeComponent extends JsxNode<FC> implements JsxNode {
  async getStringStream(ctx: GetStringStreamProps) {
    return getStringStreamComponent.call(this, ctx);
  }

  async hydrate(ctx: HydrateProps) {
    return hydrateComponent.call(this, ctx);
  }
  async render(ctx: RenderProps) {
    return renderComponent.call(this, ctx);
  }
}
