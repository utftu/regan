import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {SELECT_REGAN_NAMED} from '../atoms/atoms.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {StringContext} from '../node/string/string.ts';

type StringStream = TransformStream<string, string>;

export async function handleChildrenString({
  children,
  streams,
  globalCtx,
  parentJsxSegment,
  stringContext,
}: {
  children: Child[];
  streams: StringStream;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  stringContext: StringContext;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;
  const childrenStreams = children.map((rawChild) => {
    const child = typeof rawChild === 'function' ? rawChild() : rawChild;

    if (child instanceof JSXNode) {
      const stream = child.getStringStream({
        globalCtx,
        jsxSegmentStr: jsxNodeCount.toString(),
        parentJsxSegment: {
          jsxSegment: parentJsxSegment,
          position: jsxNodeCount,
        },
        stringContext: stringContext,
      });
      jsxNodeCount++;
      return stream;
    }

    if (child instanceof Atom) {
      let value: any;
      let name: string;
      if ((child as any)[SELECT_REGAN_NAMED]) {
        [name, value] = stringContext.snapshot.parse(child);
      } else {
        value = stringContext.snapshot.parse(child);
        name = '0';
      }

      if (value instanceof JSXNode) {
        return value.getStringStream({
          globalCtx,
          jsxSegmentStr: `${jsxNodeCount.toString()}?a=${name}`,
          parentJsxSegment: {
            jsxSegment: parentJsxSegment,
            position: jsxNodeCount,
          },
          stringContext: stringContext,
        });
      }

      jsxNodeCount++;
      return value;
    }

    return rawChild;
  });

  for (const childStream of childrenStreams) {
    // null, undefined
    if (!childStream) {
      continue;
    }

    // todo not only string
    if (typeof childStream === 'string') {
      const writer = streams.writable.getWriter();
      await writer.write(childStream);
      writer.releaseLock();
      continue;
    }

    const childStreams = await childStream;

    await childStreams.pipeTo(streams.writable, {preventClose: true});
  }
}
