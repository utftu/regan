import {SystemProps} from './types.ts';

export const noop = () => {};

export const DYNAMIC_INSERTED_COUNT = Symbol('DYNAMIC_INSERTED_COUNT');
export const INSERTED_COUNT = Symbol('INSERTED_COUNT');

export const defaultSystemProps: SystemProps = {
  key: '',
  needAwait: false,
  insertedTagsCount: 1,
};
