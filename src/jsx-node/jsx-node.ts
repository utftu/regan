import {FC, Props, SingleChild, SystemProps} from '../types.ts';
import {SegmentEnt} from '../segment/segment.ts';

// Узел из JSX: обычные данные, без методов. Что с ним делать, решает стадия —
// render, hydrate или stringify, каждая по своему switch.

type JsxNodeBase = {
  // метка для checkJsxNode: детьми приходит что угодно, и нужно отличить
  // свой узел от чужого объекта. Не instanceof — при двух копиях пакета
  // классы разные, а поле переживёт
  jsxNode: true;
  props: Props;
  systemProps: SystemProps;
  children: SingleChild[];
  segmentEnt?: SegmentEnt;
};

export type JsxNodeElement = JsxNodeBase & {
  type: 'element';
  tagName: string;
};

export type JsxNodeComponent = JsxNodeBase & {
  type: 'component';
  component: FC<any>;
};

export type JsxNode = JsxNodeElement | JsxNodeComponent;

export const createJsxNodeElement = ({
  tagName,
  props,
  systemProps = {},
  children,
}: {
  tagName: string;
  props: Props;
  systemProps?: SystemProps;
  children: SingleChild[];
}): JsxNodeElement => {
  return {
    jsxNode: true,
    type: 'element',
    tagName,
    props,
    systemProps,
    children,
  };
};

export const createJsxNodeComponent = ({
  component,
  props,
  systemProps = {},
  children,
}: {
  component: FC<any>;
  props: Props;
  systemProps?: SystemProps;
  children: SingleChild[];
}): JsxNodeComponent => {
  return {
    jsxNode: true,
    type: 'component',
    component,
    props,
    systemProps,
    children,
  };
};

export const checkJsxNode = (value: unknown): value is JsxNode => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as JsxNode).jsxNode === true
  );
};
