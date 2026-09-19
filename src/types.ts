import {Atom} from 'strangelove';
import {JsxNode} from './jsx-node/jsx-node.ts';
import {Ctx} from './ctx/ctx.ts';

// гидратация идёт по позициям: узел, который сейчас разбираем
export type DomPointer = {
  parent: ParentNode | Document;
  nodeCount: number;
};

// рендер и обновление вставляют: узел, после которого класть следующий
export type InsertPoint = {
  parent: ParentNode | Document;
  prevNode?: ChildNode;
};

export type AnyFunc = (...args: any[]) => any;

export type SingleChild =
  JsxNode | string | null | undefined | void | Atom | ((...args: any[]) => any);

export type Child = SingleChild | SingleChild[];

export type FC<TProps extends Record<any, any> = any> = (
  props: TProps,
  ctx: Ctx<TProps>,
) => Child;

export type Props = Record<string, any>;

export type Ref =
  Atom<Element | undefined> | ((element: Element | undefined) => void);

export type SystemProps = {
  key?: string;
  ref?: Ref;
  rawHtml?: string;
};

export type Data = {envs: Record<any, any>; props: Record<any, any>} & Record<
  any,
  any
>;
