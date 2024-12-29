import {createControlledPromise} from 'utftu';
import {DOM_NODES_INFO, NEED_AWAIT, defaultInsertedInfo} from '../consts.ts';
import {JsxNodeComponent} from '../node/variants/component/component.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {JsxNode} from '../node/node.ts';
import {FCStaticParams} from '../types.ts';

export type InsertedInfo = {
  // prevType?: 'element' | 'text';
  nodeCount: number;
  // elemsCount: number;
  textLength?: number;
};

export const tryDetectInsertedInfoComponentImmediately = (
  child: JsxNodeComponent
): InsertedInfo | void => {
  const type = child.type as FCStaticParams;

  if (DOM_NODES_INFO in type) {
    return type[DOM_NODES_INFO];
  }

  if (type[NEED_AWAIT]) {
    return;
  }

  return defaultInsertedInfo;
};

export const getInsertedInfo = async (
  child: JsxNode,
  insertedInfoPromise: Promise<InsertedInfo>
): Promise<InsertedInfo> => {
  if (child instanceof JsxNodeElement) {
    return defaultInsertedInfo;
  } else if (child instanceof JsxNodeComponent) {
    const type = child.type as FCStaticParams;
    const insertedInfo = tryDetectInsertedInfoComponentImmediately(child);

    if (insertedInfo) {
      return insertedInfo;
    }

    if (type[NEED_AWAIT] === true) {
      const insertedInfo = await insertedInfoPromise;
      return insertedInfo;
    }
  }
  return defaultInsertedInfo;
};

export const createInsertedDomNodePromise = () => {
  const [promise, promiseControls] = createControlledPromise<InsertedInfo>();
  return {
    promise,
    promiseControls,
  };
};
