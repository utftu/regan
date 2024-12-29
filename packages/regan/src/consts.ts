import {SystemProps} from './types.ts';
import {InsertedInfo} from './utils/inserted-dom.ts';

export const noop = () => {};

export const NEED_AWAIT = Symbol('NEED_AWAIT');
export const DOM_NODES_INFO = Symbol('DOM_NODES_INFO');

export const defaultInsertedInfo: InsertedInfo = {
  nodeCount: 1,
} as const;

export const defaultSystemProps: SystemProps = {
  key: '',
  // needAwait: false,
};
