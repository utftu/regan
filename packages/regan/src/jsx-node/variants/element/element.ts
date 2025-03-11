import {JsxNode, JsxNodeProps} from '../../jsx-node.ts';
import {HydrateProps} from '../../../hydrate/types.ts';

export class JsxNodeElement extends JsxNode {
  tagName: string;
  constructor(props: JsxNodeProps, {tagName}: {tagName: string}) {
    super(props);
    this.tagName = tagName;
  }

  // stingify(ctx: StringifyProps) {
  //   return null as any;
  //   // return getStringStreamElement.call(this, ctx);
  // }

  hydrate(ctx: HydrateProps) {
    return null as any;
    // return hydrateElement.call(this, ctx);
  }

  // render(ctx: RenderProps): RenderResult {
  //   return null as any;
  //   // return renderElement.call(this, ctx);
  // }
}
