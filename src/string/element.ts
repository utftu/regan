import {Atom} from 'strangelove';
import {JSXNodeElement} from '../node/element/element.ts';
import {GetStringStreamProps} from '../node/node.ts';
import {createElementString} from './flat.ts';
import {handleChildrenString} from './children.ts';

export async function getStringStreamElement(
  this: JSXNodeElement,
  ctx: GetStringStreamProps
) {
  const streams = new TransformStream<string, string>();

  const preparedProps = Object.entries(this.props).reduce(
    (store, [key, value]) => {
      if (typeof value === 'function') {
        return store;
      }
      const realValue = value instanceof Atom ? value.get() : value;
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
      jsxPath: ctx.jsxPath,
      globalCtx: ctx.globalCtx,
    });

    const writer2 = streams.writable.getWriter();
    await writer2.write(elementString.right);
    writer2.releaseLock();

    await streams.writable.close();
  });

  return streams.readable;
}
