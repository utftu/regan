import {JsxNode} from '../../jsx-node.ts';
import {getStringStreamElement} from '../../../string/element.ts';
import {hydrateElement} from '../../../hydrate/element.ts';
import {renderElement} from '../../../render/element.ts';
import {RenderProps, RenderResult} from '../../../render/types.ts';
import {HydrateProps} from '../../../hydrate/types.ts';
import {GetStringStreamProps} from '../../../string/types.ts';

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
