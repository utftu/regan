import {JsxNode} from './node/node.ts';
import {Ctx} from './ctx/ctx.ts';
import {Atom} from 'strangelove';
import {ContextValue} from './context/context.tsx';
import {DOM_NODES_INFO, NEED_AWAIT} from './consts.ts';
import {InsertedDomNodes} from './utils/inserted-dom.ts';
import {DomNodesInfo} from './node/hydrate/hydrate.ts';

export type AynFunc = (...args: any[]) => any;
export type AnyProps = Record<any, any>;

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

export type FCStaticParams = {
  [NEED_AWAIT]?: boolean;
  [DOM_NODES_INFO]?: DomNodesInfo;
};

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => FCReturn;

export type SystemProps = {
  key?: string;
  needAwait?: boolean;
  insertedDomNodes?: InsertedDomNodes;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
  context?: ContextValue;
};

export type HtmlChild = HTMLElement | string;

export type DomPointer<Parent extends Node = Node> = {
  parent: Parent;
  position: number;
};

export type DomPointerElement = DomPointer<Element>;
