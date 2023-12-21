import {JSXNode} from '../node.ts';
import {getStringStreamComponent} from '../../string/component.ts';
import {hydrateComponent} from '../../hydrate/component.ts';
import {renderComponent} from '../../render/component.ts';
import {GetStringStreamProps} from '../string/string.ts';
import {HydrateProps} from '../hydrate/hydrate.ts';
import {RenderProps} from '../render/render.ts';

export class JSXNodeComponent extends JSXNode implements JSXNode {
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
