import {HNodeBase} from '../../../h-node/h-node.ts';
import {FC} from '../../../types.ts';
import {HydrateProps} from '../../hydrate/hydrate.ts';
import {JsxNode} from '../../node.ts';
import {GetStringStreamProps} from '../../string/string.ts';

export class JsxNodeText extends JsxNode<string> implements JsxNode {
  async getStringStream(ctx: GetStringStreamProps) {
    const streams = new TransformStream<string, string>();

    const writer = streams.writable.getWriter();
    writer.write(this.type);
    writer.releaseLock();

    return streams.readable;
  }
  async hydrate(ctx: HydrateProps) {}
}

export class HNodeText extends HNodeBase {}
