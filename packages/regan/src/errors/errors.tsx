import {NEED_AWAIT, DOM_NODES_INFO} from '../consts.ts';
import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FC, FCStaticParams} from '../types.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {SegmentComponent} from '../segments/component.ts';

type Props = {
  error: Error;
  segmentEnt: SegmentEnt;
  segmentComponent?: SegmentComponent;
};

type ErrorHandler = (props: Props) => void;
type ErrorJsx = FC<Props>;

// insert native html fragment to save css styles
const createJsxErrorDump = (count: number): JsxNode[] | null => {
  if (count === 0) {
    return null;
  }

  return new Array(count).fill(null).map(() => h('fragment', {}, []));
};

// try to understand how many places should be occupied
const getElementsCount = ({jsxNode}: {jsxNode: JsxNode<FC>}): number => {
  if (jsxNode instanceof JsxNodeElement) {
    return 1;
  }

  if (jsxNode.systemProps.insertedDomNodes) {
    return jsxNode.systemProps.insertedDomNodes.count;
  }

  const type = jsxNode.type as FCStaticParams;
  if (DOM_NODES_INFO in type) {
    return type[DOM_NODES_INFO]!.elemsCount;
  }

  if (
    jsxNode.systemProps.needAwait === true ||
    (jsxNode.type as FCStaticParams)[NEED_AWAIT] === true
  ) {
    return 0;
  }

  return 1;
};

export const defaultErrorHandler = () => {};
export const defaultErrorJsx = ({segmentEnt}: Props) => {
  const count = getElementsCount({jsxNode: segmentEnt.jsxNode});

  return createJsxErrorDump(count);
};

const defaultErrorConfig = {
  error: defaultErrorHandler,
  errorJsx: defaultErrorJsx,
};
export const errorContext = createContext<{
  error: ErrorHandler;
  errorJsx: ErrorJsx;
}>('system error', defaultErrorConfig);

export const ErrorGuard: FC<{error?: ErrorHandler; errorJsx?: FC}> = (
  {error, errorJsx},
  {children}
) => {
  return h(
    errorContext.Provider,
    {
      value: {
        error: error ?? defaultErrorHandler,
        errorJsx: errorJsx ?? defaultErrorJsx,
      },
    },
    children
  );
};
