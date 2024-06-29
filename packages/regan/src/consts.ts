import {SystemProps} from './types.ts';

export const noop = () => {};

export const NEED_AWAIT = Symbol('NEED_AWAIT');
export const DOM_NODES_INFO = Symbol('DOM_NODES_INFO');
// export const INSERTED_DOM_NODES = Symbol('INSERTED_DOM_NODES');

export const defaultDomNodesInfo = {
  elemsCount: 1,
  textLength: 0,
};

export const defaultSystemProps: SystemProps = {
  key: '',
  needAwait: false,
};
