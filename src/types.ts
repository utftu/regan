import {JSXNode} from './node/node.ts';
import {Ctx} from './ctx/ctx.ts';
import {Atom} from 'strangelove';
import {Context} from './context/context.tsx';
import {INSERTED_TAGS_COUNT, NEED_AWAIT} from './consts.ts';

export type Child =
  | JSXNode
  | string
  | null
  | undefined
  | void
  | Atom
  | ((...args: any[]) => any);
export type Props = Record<string, any>;

export type Unmount = () => void;
export type Mount = () => Unmount | Promise<Unmount> | any;

export type FCReturn = Child | Child[] | Promise<Child> | Promise<Child[]>;

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => FCReturn;

export type ElementPointer = {
  parent: HTMLElement;
  prev?: HTMLElement;
};

export type SystemProps = {
  key?: string;
  needAwait?: boolean;
  insertedTagsCount?: number;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
  context?: Context;
  contextValue?: any;
};

export type FCParams = {
  [NEED_AWAIT]?: boolean;
  [INSERTED_TAGS_COUNT]?: number;
};
