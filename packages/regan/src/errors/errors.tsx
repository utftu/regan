import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FC} from '../types.ts';
// import {SegmentEnt} from '../segments/ent/ent.ts';
import {tryDetectInsertedInfoComponentImmediately} from '../utils/inserted-dom.ts';

type Props = {
  error: Error;
  // segmentEnt: SegmentEnt;
  jsxNode: JsxNode;
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
const getNodesCount = ({jsxNode}: {jsxNode: JsxNode<FC>}): number => {
  if (jsxNode instanceof JsxNodeElement) {
    return 1;
  }

  const insertedInfo = tryDetectInsertedInfoComponentImmediately(jsxNode);

  if (!insertedInfo) {
    return 0;
  }

  return insertedInfo.nodeCount;
};

export const defaultErrorHandler = () => {};
export const defaultErrorJsx = ({jsxNode}: Props) => {
  const count = getNodesCount({jsxNode});

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
