import {Atom} from 'strangelove';
import {JsxNode} from './jsx-node/jsx-node.ts';
import {Ctx} from './ctx/ctx.ts';
import {AreaCtx, GlobalCtx} from './ctx/global.ts';
import {SegmentEnt} from './segment/segment.ts';

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

export type FC<TProps extends Record<any, any> = any> = ((
  props: TProps,
  ctx: Ctx<TProps>,
) => Child) & {
  // имя для путей в ошибках: minify переименовывает функции, а это поле
  // переживает сборку
  displayName?: string;
  // служебные компоненты самого regan в путь ошибок не попадают: человек их
  // не писал и узла в разметке они не создают
  reganInternal?: boolean;
};

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

// Общее у всех трёх стадий: где мы в дереве JSX и что за окружение.
// Своё каждая добавляет сверху.
export type StageProps<TGlobalCtx = GlobalCtx> = {
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  globalCtx: TGlobalCtx;
  areaCtx: AreaCtx;
};
