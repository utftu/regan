import {JsxNode} from '../../node.ts';
import {getStringStreamElement} from '../../../string/element.ts';
import {hydrateElement} from '../../../hydrate/element.ts';
import {renderElement} from '../../../render/element.ts';
import {GetStringStreamProps} from '../../string/string.ts';
import {HydrateProps} from '../../hydrate/hydrate.ts';
import {RenderProps, RenderResult} from '../../../render/types.ts';

export class JsxNodeElement extends JsxNode<string> implements JsxNode {
  async getStringStream(ctx: GetStringStreamProps) {
    return getStringStreamElement.call(this, ctx);
  }

  async hydrate(ctx: HydrateProps) {
    return hydrateElement.call(this, ctx);
  }

  async render(ctx: RenderProps): RenderResult {
    return renderElement.call(this, ctx);
  }
}
