import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {createElementString} from './flat.ts';
import {handleChildrenString} from './children.ts';
import {JsxSegment} from '../jsx-path/jsx-path.ts';
import {GetStringStreamProps} from '../node/string/string.ts';

export async function getStringStreamElement(
  this: JSXNodeElement,
  ctx: GetStringStreamProps
) {
  const jsxSegment = new JsxSegment({
    segment: ctx.jsxSegmentStr,
    parent: ctx.parentJsxSegment,
  });
  const streams = new TransformStream<string, string>();

  const preparedProps = Object.entries(this.props).reduce(
    (store, [key, value]) => {
      if (typeof value === 'function') {
        return store;
      }

      let realValue;

      if (value instanceof Atom) {
        realValue = ctx.stringContext.snapshot.parse(value);
      } else {
        realValue = value;
      }

      store[key] = realValue;
      return store;
    },
    {} as Record<string, any>
  );

  const elementString = createElementString({
    type: this.type,
    props: preparedProps,
  });

  Promise.resolve().then(async () => {
    const writer = streams.writable.getWriter();

    await writer.write(elementString.left);
    writer.releaseLock();

    await handleChildrenString({
      children: this.children,
      streams,
      parentJsxSegment: jsxSegment,
      globalCtx: ctx.globalCtx,
      stringContext: ctx.stringContext,
    });

    const writer2 = streams.writable.getWriter();
    await writer2.write(elementString.right);
    writer2.releaseLock();

    await streams.writable.close();
  });

  return streams.readable;
}
