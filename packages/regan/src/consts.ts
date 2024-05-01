import {SystemProps} from './types.ts';

export const noop = () => {};

export const NEED_AWAIT = Symbol('NEED_AWAIT');
export const INSERTED_TAGS_COUNT = Symbol('INSERTED_TAGS_COUNT');

export const defaultSystemProps: SystemProps = {
  key: '',
  needAwait: false,
  insertedTagsCount: 1,
};
