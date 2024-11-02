import {createControlledPromise} from 'utftu';
import {DOM_NODES_INFO, NEED_AWAIT, defaultInsertedInfo} from '../consts.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FCStaticParams} from '../types.ts';

export type TextDomNode = {
  type: 'text';
  length: number;
};

export type ElDomNode = {
  type: 'el';
};

export type InsertedInfo = {
  elemsCount: number;
  textLength: number;
};

// export const getInsertedCountRender = async (
//   child: JsxNode,
//   execResult: Promise<{insertedDomCount: number}>
// ): Promise<number> => {
//   if (child instanceof JsxNodeElement) {
//     return 1;
//   } else if (child instanceof JsxNodeComponent) {
//     if (
//       child.systemProps.needAwait === true ||
//       (child.type as FCStaticParams)[NEED_AWAIT] === true
//     ) {
//       const {insertedDomCount} = await execResult;
//       return insertedDomCount;
//     } else if ('insertedDomNodes' in child.systemProps) {
//       return child.systemProps.insertedDomNodes!.length;
//     } else if (INSERTED_DOM_NODES in child.type) {
//       return (child.type[INSERTED_DOM_NODES] as InsertedDomNodes).length;
//     } else {
//       return 1;
//     }
//   }
//   return 1;
// };

// export const getInsertedCount = async (
//   child: JsxNode,
//   awaitInsertedDomNodes: Promise<DomNodesInfo>
// ): Promise<DomNodesInfo> => {
//   if (child instanceof JsxNodeElement) {
//     return defaultDomNodesInfo;
//   } else if (child instanceof JsxNodeComponent) {
//     if (
//       child.systemProps.needAwait === true ||
//       (child.type as FCStaticParams)[NEED_AWAIT] === true
//     ) {
//       const insertedDomNodes = await awaitInsertedDomNodes;
//       return insertedDomNodes;
//     } else if (DOM_NODES_INFO in child.type) {
//       return child.type[DOM_NODES_INFO] as DomNodesInfo;
//     } else {
//       return defaultDomNodesInfo;
//     }
//   }
//   return defaultDomNodesInfo;
// };

export const getInsertedInfo = async (
  child: JsxNode,
  insertedInfoPromise: Promise<InsertedInfo>
): Promise<InsertedInfo> => {
  if (child instanceof JsxNodeElement) {
    return defaultInsertedInfo;
  } else if (child instanceof JsxNodeComponent) {
    const type = child.type as FCStaticParams;
    if (type[NEED_AWAIT] === true) {
      const insertedDomNodes = await insertedInfoPromise;
      return insertedDomNodes;
    } else if (DOM_NODES_INFO in type) {
      return type[DOM_NODES_INFO] as InsertedInfo;
    } else {
      return defaultInsertedInfo;
    }
  }
  return defaultInsertedInfo;
};

// const checkNodeInfo = (jsxNode: JsxNodeComponent) => {
//   const type = jsxNode.type as FCStaticParams;
//   if (type[NEED_AWAIT] === true) {
//     return false;
//   }

//   return true;
// };

// export const getComponentDomNodeInfoCount = (
//   child: JsxNodeComponent
// ): InsertedInfo | void => {
//   const type = child.type as FCStaticParams;
//   if (DOM_NODES_INFO in type) {
//     return type[DOM_NODES_INFO] as InsertedInfo;
//   } else if (type[NEED_AWAIT] === true) {
//     return undefined;
//   }

//   return defaultInsertedInfo;
// };

export const createInsertedDomNodePromise = () => {
  const [promise, promiseControls] = createControlledPromise<InsertedInfo>();
  return {
    promise,
    promiseControls,
  };
};
