import {AreaCtx, GlobalCtx} from '../ctx/global.ts';
import {HNode} from '../h-node/h-node.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {walkChildren} from '../jsx-node/children.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild} from '../types.ts';
import {createMatcher} from './align.ts';
import {RenderNode} from './node.ts';
import {RenderProps, RenderResult} from './types.ts';
import {renderElement} from './element.ts';
import {renderComponent} from './component.ts';

// Что делать с узлом, решает его вид — методов у него больше нет.
export function renderJsxNode(
  jsxNode: JsxNode,
  props: RenderProps,
): RenderResult {
  if (jsxNode.type === 'element') {
    return renderElement(jsxNode, props);
  }

  return renderComponent(jsxNode, props);
}

export type HandleChildrenResult = {
  renderNodes: RenderNode[];
};

// Компонент с ключом, который никуда не делся, не запускаем заново:
// его поддерево вместе с замыканиями и подписками остаётся жить.
// Пропы у него, соответственно, заморожены на первом рендере.
const checkKeep = (jsxNode: JsxNode, oldHNode?: HNode) => {
  if (!oldHNode || jsxNode.systemProps.key === undefined) {
    return false;
  }

  if (jsxNode.type !== 'component') {
    return false;
  }

  const oldJsxNode = oldHNode.segmentEnt?.jsxNode;

  if (oldJsxNode?.type !== 'component') {
    return false;
  }

  return oldJsxNode.component === jsxNode.component;
};

export function handleChildren({
  children,
  parentSegmentEnt,
  globalCtx,
  areaCtx,
  oldHNodes = [],
}: {
  children: SingleChild[];
  globalCtx: GlobalCtx;
  areaCtx: AreaCtx;
  parentSegmentEnt: SegmentEnt;
  oldHNodes?: HNode[];
}): HandleChildrenResult {
  const renderNodes: RenderNode[] = [];
  const match = createMatcher(oldHNodes);

  walkChildren({
    children,
    parentSegmentEnt,
    text: (text) => {
      renderNodes.push({
        type: 'text',
        text,
        segmentEnt: parentSegmentEnt,
        globalCtx: globalCtx,
        mounts: [],
        unmounts: [],
        children: [],
        oldHNode: match(),
      });
    },
    node: (jsxNode, jsxSegmentName) => {
      const oldHNode = match(jsxNode);

      if (checkKeep(jsxNode, oldHNode)) {
        // поддерево не трогаем, но место в дереве у него новое —
        // сегмент переподвешиваем, иначе getJsxPath начнёт врать
        const keptSegmentEnt = oldHNode!.segmentEnt;
        keptSegmentEnt.parentSegmentEnt = parentSegmentEnt;
        keptSegmentEnt.name = jsxSegmentName;

        renderNodes.push({type: 'keep', oldHNode: oldHNode!});

        return;
      }

      const {renderNode} = renderJsxNode(jsxNode, {
        jsxSegmentName,
        parentSegmentEnt,
        globalCtx,
        areaCtx,
        oldHNode,
      });

      renderNodes.push(renderNode);
    },
  });

  return {renderNodes};
}
