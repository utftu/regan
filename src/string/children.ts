import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {JsxNode} from '../node/node.ts';
import {Child} from '../types.ts';
import {NAMED_ATOM_REGAN} from '../atoms/atoms.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {StringContext} from '../node/string/string.ts';
import {Ctx} from '../ctx/ctx.ts';
import {formatJsxValue} from '../utils/jsx.ts';
import {AtomWrapper} from '../components/atom-wrapper/atom-wrapper.tsx';
import {JsxNodeComponent} from '../node/component/component.ts';

type StringStream = TransformStream<string, string>;

const checkValidPrimitive = (value: any) => {
  const type = typeof value;
  if (type === 'number' || type === 'string') {
    return true;
  }

  return false;
};

export async function handleChildrenString({
  children,
  streams,
  globalCtx,
  parentJsxSegment,
  stringContext,
  parentCtx,
  parentJsxNode,
}: {
  children: Child[];
  streams: StringStream;
  globalCtx: GlobalCtx;
  parentJsxSegment: JsxSegment;
  stringContext: StringContext;
  parentCtx?: Ctx;
  parentJsxNode: JsxNode;
}) {
  // run iteration twice
  // first - to start stream process in children
  // second - to handle results

  let jsxNodeCount = 0;

  const results = [];
  for (let i = 0; i <= children.length; i++) {
    const childOrAtom = await formatJsxValue(children[i]);

    if (!childOrAtom) {
      continue;
    }

    const innerArr = Array.isArray(childOrAtom) ? childOrAtom : [childOrAtom];

    for (let j = 0; j <= innerArr.length; j++) {
      const value = innerArr[j];

      let child: JsxNode;
      if (value instanceof Atom) {
        child = new JsxNodeComponent({
          type: AtomWrapper,
          children: [],
          props: {
            atom: value,
          },
          systemProps: {},
        });
      } else {
        child = value;
      }

      if (child instanceof JsxNode) {
        const result = child.getStringStream({
          globalCtx,
          jsxSegmentStr: jsxNodeCount.toString(),
          parentJsxSegment: {
            jsxSegment: parentJsxSegment,
            position: jsxNodeCount,
          },
          stringContext: stringContext,
          parentCtx,
          parentJsxNode,
        });
        jsxNodeCount++;
        results.push(result);

        continue;
      }

      results.push(child);
    }

    // let child: JsxNode;
    // if (childOrAtom instanceof Atom) {
    //   child = new JsxNodeComponent({
    //     type: AtomWrapper,
    //     children: [],
    //     props: {
    //       atom: childOrAtom,
    //     },
    //     systemProps: {},
    //   });
    // } else {
    //   child = childOrAtom;
    // }

    // if (child instanceof JsxNode) {
    //   const result = child.getStringStream({
    //     globalCtx,
    //     jsxSegmentStr: jsxNodeCount.toString(),
    //     parentJsxSegment: {
    //       jsxSegment: parentJsxSegment,
    //       position: jsxNodeCount,
    //     },
    //     stringContext: stringContext,
    //     parentCtx,
    //     parentJsxNode,
    //   });
    //   jsxNodeCount++;
    //   results.push(result);

    //   continue;
    // }

    // results.push(child);
  }

  for (const childStream of results) {
    if (typeof childStream === 'string' || typeof childStream === 'number') {
      const writer = streams.writable.getWriter();
      await writer.write(childStream);
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
