import {SystemProps} from './types.ts';

export const noop = () => {};

export const NEED_AWAIT = Symbol('NEED_AWAIT');
export const DOM_NODES_INFO = Symbol('DOM_NODES_INFO');

export const defaultDomNodesInfo = {
  elemsCount: 1,
  textLength: 0,
} as const;

export const defaultSystemProps: SystemProps = {
  key: '',
  needAwait: false,
};
