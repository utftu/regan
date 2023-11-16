import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {SELECT_REGAN_NAMED} from '../atoms/atoms.ts';
import {JSXSegment, joinPath} from '../jsx-path/jsx-path.ts';

type StringStream = TransformStream<string, string>;

export async function handleChildrenString({
  children,
  streams,
  // jsxPath,
  globalCtx,
  parentJsxSegment,
}: {
  children: Child[];
  streams: StringStream;
  // jsxPath: string;
  globalCtx: GlobalCtx;
  parentJsxSegment?: JSXSegment;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;
  const childrenStreams = children.map((rawChild) => {
    const child = typeof rawChild === 'function' ? rawChild() : rawChild;

    if (child instanceof JSXNode) {
      const stream = child.getStringStream({
        // jsxPath: joinPath(jsxPath, jsxNodeCount.toString()),
        globalCtx,
        jsxSegmentStr: jsxNodeCount.toString(),
        parentJsxSegment: parentJsxSegment,
        // jsxSegment: new JSXSegment(jsxNodeCount.toString(), parentJsxSegment),
      });
      jsxNodeCount++;
      return stream;
    }

    if (child instanceof Atom) {
      let value: any;
      let name: string;
      if ((child as any)[SELECT_REGAN_NAMED]) {
        [name, value] = child.get();
      } else {
        value = child.get();
        name = '0';
      }

      if (value instanceof JSXNode) {
        return value.getStringStream({
          globalCtx,
          jsxSegmentStr: `${jsxNodeCount.toString()}?a=${name}`,
          parentJsxSegment: parentJsxSegment,
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
