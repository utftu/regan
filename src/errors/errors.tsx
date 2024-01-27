import {INSERTED_TAGS_COUNT, NEED_AWAIT} from '../consts.ts';
import {createContext} from '../context/context.tsx';
import {h} from '../jsx/jsx.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FC, FCStaticParams} from '../types.ts';

const createJsxErrorDump = (count: number) => {
  if (count === 0) {
    return null;
  }

  return new Array(count).fill(null).map(() => h('div', {}, []));
};

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

const defaultErrorHandler = () => <div></div>;
const defaultErrorJsx: FC<{jsxNode: JsxNode}> = ({jsxNode}) => {
  const count = getElementsCount({jsxNode});

  return createJsxErrorDump(count);
};

const defaultErrorConfig = {
  error: defaultErrorHandler,
  errorJsx: defaultErrorJsx,
};
export const errorContext = createContext<{
  error: (...args: any[]) => any;
  errorJsx: FC<{jsxNode: JsxNode}>;
}>('system error', defaultErrorConfig);

export const ErrorGuard: FC<{error?: any; errorJsx?: FC}> = (
  {error, errorJsx},
  {children}
) => {
  return h(
    errorContext.Provider,
    {
      value: {
        error: error ?? defaultErrorHandler,
        errorJsx: errorJsx ?? defaultErrorHandler,
      },
    },
    children
  );
};
