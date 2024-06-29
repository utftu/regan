import {JsxNode} from './node/node.ts';
import {Ctx} from './ctx/ctx.ts';
import {Atom} from 'strangelove';
import {ContextValue} from './context/context.tsx';
import {DOM_NODES_INFO, NEED_AWAIT} from './consts.ts';
import {InsertedDomNodes} from './utils/inserted-dom.ts';
import {DomNodesInfo} from './node/hydrate/hydrate.ts';

export type Child =
  | JsxNode
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
  // insertedTagsCount?: number;
  insertedDomNodes?: InsertedDomNodes;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
  context?: ContextValue;
};

export type FCStaticParams = {
  [NEED_AWAIT]?: boolean;
  [DOM_NODES_INFO]?: DomNodesInfo;
  // [INSERTED_DOM_NODES]?: number;
};

export type HtmlChild = HTMLElement | string;

export type DomPointer<Parent extends Node = Node> = {
  parent: Parent;
  position: number;
};

export type DomPointerElement = DomPointer<Element>;

export type DomPointerCertain = DomPointer & {
  innerPosition: {
    start: number;
    finish: number;
  };
};
