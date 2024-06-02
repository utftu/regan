import {SystemProps} from './types.ts';

export const noop = () => {};

export const NEED_AWAIT = Symbol('NEED_AWAIT');
export const INSERTED_DOM_NODES = Symbol('INSERTED_DOM_NODES');

export const defaultSystemProps: SystemProps = {
  key: '',
  needAwait: false,
};
