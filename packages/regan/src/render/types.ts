import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, HNodeCtx} from '../h-node/h-node.ts';
import {
  JsxSegment,
  JsxSegmentWrapper,
  ParentJsxSegment,
} from '../jsx-path/jsx-path.ts';
import {TreeAtomsSnapshot} from '../tree-atoms-snapshot/tree-aroms-snapshot.ts';
import {Ctx} from '../ctx/ctx.ts';
import {ParentWait} from '../node/hydrate/hydrate.ts';
import {VNewElement, VNewText, VOldElement, VOldText} from '../v/v.ts';
import {HNodeElement} from '../h-node/element.ts';
import {HNodeText} from '../h-node/text.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';

export type RenderTemplateComponent = {
  type: 'component';
  hNode: HNode;

  children: RenderTemplate[];
};

export type RenderTemplateComponentExtended = Omit<
  RenderTemplateComponent,
  'children'
> & {
  children: RenderTemplateExtended[];
};

export type RenderTemplateElement = {
  type: 'element';
  vNew: VNewElement;
  jsxSegment: JsxSegment;
  jsxNode: JsxNodeElement;
  init: (hNode: HNodeElement, vOld: VOldElement) => void;

  children: RenderTemplate[];
};

export type RenderTemplateElementExtended = Omit<
  RenderTemplateElement,
  'children'
> & {
  vOld: VOldElement;

  children: RenderTemplateExtended[];
};

const a: RenderTemplateElementExtended = null as any;
// a.children

export type RenderTemplateText = {
  type: 'text';
  vNew: VNewText;
  // text: string;
  jsxSegment: JsxSegment;
  // init: (hNode: HNodeText, vOld: VOldText) => void;
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

// export type AddElementToParent = (elem: HTMLElement | string) => void;

export type RenderCtx = {
  snapshot: TreeAtomsSnapshot;
  changedAtoms: Atom[];
};

export type RenderProps = {
  globalCtx: GlobalCtx;
  // jsxSegmentStr: string;
  // parentJsxSegment?: ParentJsxSegment;
  jsxSegmentWrapper: JsxSegmentWrapper;
  renderCtx: RenderCtx;
  hNodeCtx: HNodeCtx;
  parentCtx?: Ctx;
  // parentWait: ParentWait;
};

export type RenderResult = Promise<{
  renderTemplate: RenderTemplate;
}>;
