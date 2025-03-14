import {ContextEnt, getContextValue} from '../context/context.tsx';
import {HNode, Mount} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {JsxNodeComponent} from '../jsx-node/variants/component/component.ts';
import {AnyFunc} from '../types.ts';
import {LisneterManager} from '../utils/listeners.ts';
import {errorContextHandler, errorContextJsx} from './errors.tsx';

export const createErrorJsxNodeComponent = (
  jsxNode: JsxNode,
  error: unknown,
  parentContextEnt?: ContextEnt
) => {
  const errorJsx = getContextValue(errorContextJsx, parentContextEnt);

  return new JsxNodeComponent(
    {
      props: {
        error,
        jsxNode,
      },
      systemProps: {},
      children: [],
    },
    {component: errorJsx}
  );
};

export const prepareListener = ({
  listenerManager,
  func,
}: {
  func: AnyFunc;
  listenerManager: LisneterManager;
}) => {
  return async (...args: any[]) => {
    try {
      await func(...args);
    } catch (error) {
      const errorHandler = getContextValue(
        errorContextHandler,
        listenerManager.segmentEnt.contextEnt
      );
      errorHandler({error, jsxNode: listenerManager.segmentEnt.jsxNode});
    }
  };
};

export const runMount = async (mount: Mount, hNode: HNode) => {
  try {
    await mount(hNode);
  } catch (error) {
    const errorHandler = getContextValue(
      errorContextHandler,
      hNode.segmentEnt.contextEnt
    );
    errorHandler({error, jsxNode: hNode.segmentEnt.jsxNode});
  }
};
