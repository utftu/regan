import {createControlledPromise} from 'utftu';
import {INSERTED_DOM_NODES, NEED_AWAIT} from '../consts.ts';
import {JsxNodeComponent} from '../node/component/component.ts';
import {JsxNodeElement} from '../node/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FCStaticParams} from '../types.ts';

export type TextDomNode = {
  type: 'text';
  length: number;
};

export type ElDomNode = {
  type: 'el';
};

export const el: ElDomNode = {type: 'el'};
export const defaultInsertedDomNodes = [el];

export type InsertedDomNodes = (TextDomNode | ElDomNode)[];

export const getInsertedCountRender = async (
  child: JsxNode,
  execResult: Promise<{insertedDomCount: number}>
): Promise<number> => {
  if (child instanceof JsxNodeElement) {
    return 1;
  } else if (child instanceof JsxNodeComponent) {
    if (
      child.systemProps.needAwait === true ||
      (child.type as FCStaticParams)[NEED_AWAIT] === true
    ) {
      const {insertedDomCount} = await execResult;
      return insertedDomCount;
    } else if ('insertedDomNodes' in child.systemProps) {
      return child.systemProps.insertedDomNodes!.length;
    } else if (INSERTED_DOM_NODES in child.type) {
      return (child.type[INSERTED_DOM_NODES] as InsertedDomNodes).length;
    } else {
      return 1;
    }
  }
  return 1;
};

export const getInsertedCount = async (
  child: JsxNode,
  awaitInsertedDomNodes: Promise<InsertedDomNodes>
): Promise<InsertedDomNodes> => {
  if (child instanceof JsxNodeElement) {
    return defaultInsertedDomNodes;
  } else if (child instanceof JsxNodeComponent) {
    if (
      child.systemProps.needAwait === true ||
      (child.type as FCStaticParams)[NEED_AWAIT] === true
    ) {
      const insertedDomNodes = await awaitInsertedDomNodes;
      return insertedDomNodes;
    } else if ('insertedDomNodes' in child.systemProps) {
      return child.systemProps.insertedDomNodes!;
    } else if (INSERTED_DOM_NODES in child.type) {
      return child.type[INSERTED_DOM_NODES] as InsertedDomNodes;
    } else {
      return defaultInsertedDomNodes;
    }
  }
  return defaultInsertedDomNodes;
};

export const createInsertedDomNodePromise = () => {
  const [promise, promiseControls] =
    createControlledPromise<InsertedDomNodes>();
  return {
    promise,
    promiseControls,
  };
};

// export const getInsertedCount = async (
//   child: JsxNode,
//   execResult: Promise<any>
// ): Promise<InsertedDomNodes> => {
//   if (child instanceof JsxNodeElement) {
//     return defaultInsertedDomNodes;
//   } else if (child instanceof JsxNodeComponent) {
//     if (
//       child.systemProps.needAwait === true ||
//       (child.type as FCStaticParams)[NEED_AWAIT] === true
//     ) {
//       const {insertedDomNodes} = await execResult;
//       return insertedDomNodes;
//     } else if ('insertedDomNodes' in child.systemProps) {
//       return child.systemProps.insertedDomNodes!;
//     } else if (INSERTED_DOM_NODES in child.type) {
//       return child.type[INSERTED_DOM_NODES] as InsertedDomNodes;
//     } else {
//       return defaultInsertedDomNodes;
//     }
//   }
//   return defaultInsertedDomNodes;
// };
