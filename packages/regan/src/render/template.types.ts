import {HNodeComponent} from '../h-node/component.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNodeText} from '../h-node/text.ts';
import {VNewElement, VNewText, VOldElement, VOldText} from '../v/types.ts';

export type RenderTComponent = {
  type: 'component';
  children: RenderT[];

  createHNode: () => HNodeComponent;
};

export type RenderTComponentExtended = Omit<RenderTComponent, 'children'> & {
  children: RenderTExtended[];
};

export type RenderTemplateElement = {
  type: 'element';
  children: RenderT[];

  vNew: VNewElement;

  createHNode: (vOld: VOldElement) => HNodeElement;
};

export type RenderTemplateElementExtended = Omit<
  RenderTemplateElement,
  'children'
> & {
  vOld: VOldElement;

  children: RenderTExtended[];
};

export type RenderTemplateText = {
  type: 'text';

  vNew: VNewText;

  createHNode: (vOld: VOldText) => HNodeText;
};

export type RenderTemplateTextExtended = RenderTemplateText & {
  vOld: VOldText;
};

export type RenderT =
  | RenderTComponent
  | RenderTemplateElement
  | RenderTemplateText;

export type RenderTExtended =
  | RenderTComponentExtended
  | RenderTemplateElementExtended
  | RenderTemplateTextExtended;
