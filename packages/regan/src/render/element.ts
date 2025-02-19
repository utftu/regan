import {JsxNodeElement} from '../node/variants/element/element.ts';
import {handleChildrenRender} from './children.ts';
import {RenderProps, RenderResult, RenderTemplateElement} from './types.ts';
import {splitProps} from '../v/convert/convert.ts';
import {SegmentEnt} from '../segments/ent/ent.ts';
import {HNodeElement} from '../h-node/element.ts';
import {VOldElement} from '../v/types.ts';
import {initDynamicSubsribes as initDynamicSubscribes} from '../utils/props/dynamic.ts';
import {subscribeAtom} from '../utils/props/atom.ts';
import {LisneterManager} from '../utils/props/funcs.ts';

export async function renderElement(
  this: JsxNodeElement,
  props: RenderProps
): RenderResult {
  // init new part of name segment
  const segmentEnt = new SegmentEnt({
    jsxSegmentName: props.jsxSegmentName,
    parentSegmentEnt: props.parentSegmentEnt,
    jsxNode: this,
    parentContextEnt: props.parentContextEnt,
  });

  // split props to dynamic and joined
  const {dynamicProps, joinedProps} = splitProps(
    this.props,
    props.renderCtx.treeAtomsSnapshot
  );

  const listenerManager = new LisneterManager(segmentEnt);

  // create render template
  const renderTemplate: RenderTemplateElement = {
    type: 'element',
    vNew: {
      type: 'element',
      data: {
        tag: this.type,
        props: joinedProps,
      },
      keyStore: {},
      children: [],
      listenerManager,
    },
    createHNode: (vOld: VOldElement) => {
      const element = vOld.element;
      const hNode = new HNodeElement(
        {
          segmentEnt,
          globalCtx: props.globalCtx,
          globalClientCtx: props.globalClientCtx,
          contextEnt: props.parentContextEnt,
        },
        {
          element,
        }
      );

      initDynamicSubscribes({
        hNode,
        dynamicProps,
        listenerManager,
      });

      for (const name in dynamicProps) {
        const atom = dynamicProps[name];

        subscribeAtom({
          exec: () => {
            vOld.data.props[name] = atom.get();
          },
          atom,
          hNode,
        });
      }

      return hNode;
    },
    connectHNode({children, hNode}) {
      children.forEach((child) => (child.parent = hNode));
      hNode.children = children;
    },
    children: [],
  };

  const {renderTemplates} = await handleChildrenRender({
    children: this.children,
    globalCtx: props.globalCtx,
    renderCtx: props.renderCtx,
    globalClientCtx: props.globalClientCtx,
    parentSegmentEnt: segmentEnt,
    parentContextEnt: props.parentContextEnt,
  });

  renderTemplate.children = renderTemplates;

  return {
    renderTemplate,
  };
}
