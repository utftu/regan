import {ContextEnt} from '../context/context.tsx';
import {GlobalClientCtx, GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {VNewElement, VNewText, VOldElement, VOldText} from '../v/types.ts';

export type RenderTemplateComponent = {
  type: 'component';
  children: RenderTemplate[];

  createHNode: () => HNodeComponent;
};

export type RenderTemplateComponentExtended = Omit<
  RenderTemplateComponent,
  'children'
> & {
  children: RenderTemplateExtended[];
};

export type RenderTemplateElement = {
  type: 'element';
  children: RenderTemplate[];

  vNew: VNewElement;

  createHNode: (vOld: VOldElement) => HNodeElement;
};

export type RenderTemplateElementExtended = Omit<
  RenderTemplateElement,
  'children'
> & {
  vOld: VOldElement;

  children: RenderTemplateExtended[];
};

export type RenderTemplateText = {
  type: 'text';

  vNew: VNewText;

  createHNode: (props: {start: number; domNode: Text}) => HNodeText;
};

export type RenderTemplateTextExtended = RenderTemplateText & {
  start: number;
  vOld: VOldText;
};

export type RenderTemplate =
  | RenderTemplateComponent
  | RenderTemplateElement
  | RenderTemplateText;

export type RenderTemplateExtended =
  | RenderTemplateComponentExtended
  | RenderTemplateElementExtended
  | RenderTemplateTextExtended;

export type RenderCtx = {};

export type RenderProps = {
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  renderCtx: RenderCtx;
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  parentContextEnt: ContextEnt;
};

export type RenderResult = {
  renderTemplate: RenderTemplate;
};
