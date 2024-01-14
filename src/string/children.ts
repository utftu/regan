import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JSXNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {NAMED_ATOM_REGAN} from '../atoms/atoms.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {StringContext} from '../node/string/string.ts';
import {Ctx} from '../ctx/ctx.ts';
import {formatJsxValue} from '../utils/jsx.ts';

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
  parentCtx?: Ctx;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;

  // for (let i = 0, jsxNodeCount = 0; i <= children.length; i++) {

  // Ъ
  const childrenStreams = children.map((rawChild) => {
    // const childOrAtom = await formatJsxValue(children[i]);
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
      if ((child as any)[NAMED_ATOM_REGAN]) {
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
