import {JsxNode, JsxNodeProps} from '../../jsx-node.ts';
import {HydrateProps, HydrateResult} from '../../../hydrate/types.ts';
import {hydrateElement} from '../../../hydrate/element.ts';
import {stringifyElement} from '../../../stringify/element.ts';
import {StringifyProps, StringifyResult} from '../../../stringify/types.ts';
import {renderElement} from '../../../render/element.ts';
import {RenderProps, RenderResult} from '../../../render/types.ts';

export class JsxNodeElement extends JsxNode {
  tagName: string;
  constructor(props: JsxNodeProps, {tagName}: {tagName: string}) {
    super(props);
    this.tagName = tagName;
  }

  stingify(ctx: StringifyProps): StringifyResult {
    return stringifyElement.call(this, ctx);
  }

  hydrate(ctx: HydrateProps): HydrateResult {
    return hydrateElement.call(this, ctx);
  }

  render(ctx: RenderProps): RenderResult {
    return renderElement.call(this, ctx);
  }
}
