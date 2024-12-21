import {Atom} from 'strangelove';
import {GlobalCtx} from '../global-ctx/global-ctx.ts';
import {HNode, GlobalClientCtx} from '../h-node/h-node.ts';
import {VNewElement, VNewText, VOldElement, VOldText} from '../v/old-v.ts';
import {HNodeElement} from '../h-node/element.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {HNodeText} from '../h-node/text.ts';
import {HNodeComponent} from '../h-node/component.ts';
import {ContextEnt} from '../context/context.tsx';

type ConnectHNode = (props: {children: HNode[]; hNode: HNode}) => void;

export type RenderTemplateComponent = {
  type: 'component';
  children: RenderTemplate[];

  createHNode: () => HNodeComponent;
  connectHNode: ConnectHNode;
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
  createHNode: ({vOld}: {vOld: VOldElement}) => HNodeElement;
  connectHNode: ConnectHNode;
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

export type RenderCtx = {
  changedAtoms: Set<Atom>;
};

export type RenderProps = {
  globalCtx: GlobalCtx;
  globalClientCtx: GlobalClientCtx;
  renderCtx: RenderCtx;
  jsxSegmentName: string;
  parentSegmentEnt?: SegmentEnt;
  // parentSegmentComponent?: SegmentComponent;
  parentContextEnt: ContextEnt;
};

export type RenderResult = Promise<{
  renderTemplate: RenderTemplate;
}>;
