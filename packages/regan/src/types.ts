import {JsxNode} from './node/node.ts';
import {Ctx} from './ctx/ctx.ts';
import {Atom} from 'strangelove';
import {DOM_NODES_INFO, NEED_AWAIT} from './consts.ts';
import {InsertedInfo} from './utils/inserted-dom.ts';

export type AnyFunc = (...args: any[]) => any;
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
  [DOM_NODES_INFO]?: InsertedInfo;
};

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>
) => FCReturn;

export type SystemProps = {
  key?: string;
  // needAwait?: boolean;
  // insertedInfo?: InsertedInfo;
  ref?: Atom<HTMLElement | void>;
  rawHtml?: string;
};

export type HtmlChild = HTMLElement | string;

export type DomPointer = {
  parent: ParentNode;
  nodeCount: number;
};

export type DomPointerWithText = DomPointer & {
  textLength?: number;
};

export type DomPointerPrev = {
  parent: ParentNode;
  prevNode?: ChildNode;
};
