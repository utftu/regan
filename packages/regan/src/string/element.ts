import {Atom} from 'strangelove';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {createElementString} from './flat.ts';
import {handleChildrenString} from './children.ts';
import {GetStringStreamProps} from './types.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-atoms-snapshot.ts';

const prepareProps = (
  props: Record<string, any>,
  atomsSnapshot: TreeAtomsSnapshot
) => {
  return Object.entries(props).reduce((store, [key, value]) => {
    if (typeof value === 'function') {
      return store;
    }

    if (value instanceof Atom) {
      atomsSnapshot.parse(value);
      store[key] = atomsSnapshot.getValue(value);
      return store;
    }

    store[key] = value;

    return store;
  }, {} as Record<string, any>);
};

export async function getStringStreamElement(
  this: JsxNodeElement,
  props: GetStringStreamProps
) {
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.pathSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    unmounts: [],
    jsxNode: this,
  });

  const streams = new TransformStream<string, string>();

  const preparedProps = prepareProps(this.props, props.stringContext.snapshot);

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
      parentContextEnt: props.parentContextEnt,
      parentSegmentEnt: segmentEnt,
      globalCtx: props.globalCtx,
      stringContext: props.stringContext,
    });

    const writer2 = streams.writable.getWriter();
    await writer2.write(elementString.right);
    writer2.releaseLock();

    await streams.writable.close();
  });

  return streams.readable;
}
