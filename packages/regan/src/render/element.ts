import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {
  RenderProps,
  RenderResult,
  RenderTemplate,
  RenderTemplateElement,
} from './types.ts';
import {initDynamicSubsribes, subscribeAtom} from '../utils/props/props.ts';
import {splitProps} from '../v/convert/convert.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {HNodeElement} from '../h-node/element.ts';

export async function renderElement(
  this: JsxNodeElement,
  props: RenderProps
): RenderResult {
  const jsxNode = this;
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSystemEnt: props.parentSegmentEnt,
    unmounts: [],
    jsxNode: this,
  });

  const {dynamicProps, joinedProps} = splitProps(this.props);

  const renderTemplate = {
    type: 'element',
    vNew: {
      type: 'element',
      tag: this.type,
      props: joinedProps,
      children: [],
    },
    createHNode: ({vOld}) => {
      const hNode = new HNodeElement(
        {
          segmentEnt,
          globalCtx: props.globalCtx,
          globalClientCtx: props.globalClientCtx,
        },
        {
          element: vOld.node,
          jsxNode,
        }
      );

      initDynamicSubsribes({
        hNode,
        dynamicProps,
        segmentEnt,
        segmentComponent: props.parentSegmentComponent,
        changedAtoms: props.renderCtx.changedAtoms,
      });

      for (const name in dynamicProps) {
        const atom = dynamicProps[name];

        subscribeAtom({
          tempExec: () => props.renderCtx.changedAtoms.add(atom),
          exec: () => {
            vOld.props[name] = atom.get();
          },
          atom,
          segmentEnt,
          hNode,
        });
      }

      return hNode;
    },
    connectHNode({children, hNode}) {
      children.forEach((child) => (child.parent = hNode));
      hNode.children = children;
    },
    children: [] as RenderTemplate[],
  } satisfies RenderTemplateElement;

  const {renderTemplates} = await handleChildrenRender({
    children: this.children,
    globalCtx: props.globalCtx,
    renderCtx: props.renderCtx,
    globalClientCtx: props.globalClientCtx,
    parentSegmentEnt: segmentEnt,
    parentSegmentComponent: props.parentSegmentComponent,
    parentContextEnt: props.parentContextEnt,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
