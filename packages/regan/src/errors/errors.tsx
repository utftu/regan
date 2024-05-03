import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FC, FCStaticParams} from '../types.ts';

type Props = {error: Error; jsxNode: JsxNode};

type ErrorHandler = ({error, jsxNode}: Props) => void;
type ErrorJsx = FC<Props>;

// insert native html fragment to save css styles
const createJsxErrorDump = (count: number): JsxNode[] | null => {
  if (count === 0) {
    return null;
  }

  return new Array(count).fill(null).map(() => h('fragment', {}, []));
};

// try to understand how many places should be occupied
const getElementsCount = ({jsxNode}: {jsxNode: JsxNode}) => {
  if (jsxNode instanceof JsxNodeElement) {
    return 1;
  }

  if ('insertedTagsCount' in jsxNode.systemProps) {
    return jsxNode.systemProps.insertedTagsCount!;
  }

  if (INSERTED_TAGS_COUNT in jsxNode.type) {
    return jsxNode.type[INSERTED_TAGS_COUNT] as number;
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
export const defaultErrorJsx = ({jsxNode}: Props) => {
  const count = getElementsCount({jsxNode});

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
