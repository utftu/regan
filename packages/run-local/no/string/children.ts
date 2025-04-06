import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {formatJsxValue, wrapChildIfNeed} from '../utils/jsx.ts';
import {ContextEnt} from '../context/context.tsx';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {StringContext} from './types.ts';

type StringStream = TransformStream<string, string>;

const checkPrimitive = (value: any): value is string | number => {
  const type = typeof value;
  if (type === 'string' || type === 'number') {
    return true;
  }

  return false;
};

export async function handleChildrenString({
  children,
  streams,
  globalCtx,
  stringContext,
  parentContextEnt,
  parentSegmentEnt,
}: {
  children: Child[];
  streams: StringStream;
  globalCtx: GlobalCtx;
  stringContext: StringContext;
  parentContextEnt: ContextEnt | undefined;
  parentSegmentEnt: SegmentEnt | undefined;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;

  const results = [];
  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom && checkPrimitive(childOrAtom) === false) {
      continue;
    }

    const child = wrapChildIfNeed(childOrAtom);

    if (child instanceof JsxNode) {
      const result = child.getStringStream({
        globalCtx,
        pathSegmentName: jsxNodeCount.toString(),
        parentSegmentEnt,
        parentContextEnt,
        stringContext,
      });
      jsxNodeCount++;
      results.push(result);

      continue;
    }

    results.push(child);
  }

  for (const childStream of results) {
    if (checkPrimitive(childStream)) {
      const writer = streams.writable.getWriter();
      await writer.write(childStream as string);
      writer.releaseLock();
      continue;
    }

    if (!childStream) {
      continue;
    }

    const childStreams = await childStream;

    await childStreams.pipeTo(streams.writable, {preventClose: true});
  }
}
