import {JsxNode} from '../jsx-node/jsx-node.ts';
import {FC, SystemProps} from '../types.ts';
import {A, Div, Head, Html, Input, Body, Script, Template} from './elements.ts';

export declare namespace JSX {
  export type ElementType = string | FC<any>;
  export type Element = JsxNode;
  
  // Пустой интерфейс = children не проверяются в props компонентов
  export interface ElementChildrenAttribute {}

  // Системные пропы принимает любой компонент, объявлять их в его props не надо.
  // Компонент без объявленных пропов (`any` или `{}`) и так принимает всё,
  // подмешивать к нему нечего.
  export type LibraryManagedAttributes<TComponent, TProps> = 0 extends 1 &
    TProps
    ? TProps
    : keyof TProps extends never
      ? TProps
      : TProps & SystemProps;
  
  export type IntrinsicElements = {
    div: Div;
    a: A;
    input: Input;
    html: Html;
    head: Head;
    body: Body;
    script: Script;
    template: Template;
  } & Record<string, any>;
}
