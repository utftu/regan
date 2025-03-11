import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNodeText} from '../h-node/text.ts';
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

  createHNode: (props: {domNode: Text}) => HNodeText;
};

export type RenderTemplateTextExtended = RenderTemplateText & {
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
