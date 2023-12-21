import {JSXNode} from '../node.ts';
import {getStringStreamElement} from '../../string/element.ts';
import {hydrateElement} from '../../hydrate/element.ts';
import {renderElement} from '../../render/element.ts';
import {GetStringStreamProps} from '../string/string.ts';
import {HydrateProps} from '../hydrate/hydrate.ts';
import {RenderProps} from '../render/render.ts';

export class JSXNodeElement extends JSXNode implements JSXNode {
  async getStringStream(ctx: GetStringStreamProps) {
    return getStringStreamElement.call(this, ctx);
  }

  async hydrate(ctx: HydrateProps) {
    return hydrateElement.call(this, ctx);
  }

  async render(ctx: RenderProps) {
    return renderElement.call(this, ctx);
  }
}
