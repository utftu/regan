import {AreaCtx, GlobalCtx} from '../ctx/global.ts';
import {HNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {JsxNode} from '../jsx-node/jsx-node.ts';
import {walkChildren} from '../jsx-node/children.ts';
import {SegmentEnt} from '../segment/segment.ts';
import {SingleChild, DomPointer} from '../types.ts';
import {commentNodeType} from '../consts.ts';
import {HydrateProps, HydrateResult} from './types.ts';
import {hydrateElement} from './element.ts';
import {hydrateComponent} from './component.ts';

// Что делать с узлом, решает его вид — методов у него больше нет.
export function hydrateJsxNode(
  jsxNode: JsxNode,
  props: HydrateProps,
): HydrateResult {
  if (jsxNode.type === 'element') {
    return hydrateElement(jsxNode, props);
  }

  return hydrateComponent(jsxNode, props);
}

export type HandleChildrenHydrateResult = {
  hNodes: HNode[];
  nodeCount: number;
};

// stringify ставит разделитель между соседними текстами, иначе браузер
// склеит их в один узел. Своё дело он сделал при парсинге — убираем,
// чтобы дерево совпадало с тем, что даёт клиентский рендер.
const removeTextSeparator = (
  parent: ParentNode | Document,
  index: number,
): void => {
  const node = parent.childNodes[index];

  if (node && node.nodeType === commentNodeType && node.nodeValue === '') {
    (node as ChildNode).remove();
  }
};

export function handleChildrenHydrate({
  children,
  parentHNode,
  globalCtx,
  parentDomPointer,
  parentSegmentEnt,
  areaCtx,
}: {
  children: SingleChild[];
  parentHNode: HNode;
  globalCtx: GlobalCtx;
  parentDomPointer: DomPointer;
  parentSegmentEnt: SegmentEnt;
  areaCtx: AreaCtx;
}): HandleChildrenHydrateResult {
  const hNodes: HNode[] = [];
  const nodeCountInit = parentDomPointer.nodeCount;

  // гидратация идёт по позициям в разметке: курсор по childNodes родителя
  let nodeCount = nodeCountInit;

  walkChildren({
    children,
    parentSegmentEnt,
    text: (text) => {
      const textNode = parentDomPointer.parent.childNodes[nodeCount] as Text;

      hNodes.push(
        new HNodeText(
          {parent: parentHNode, globalCtx, segmentEnt: parentSegmentEnt},
          {text, textNode},
        ),
      );

      nodeCount++;
      removeTextSeparator(parentDomPointer.parent, nodeCount);
    },
    node: (jsxNode, jsxSegmentName) => {
      const result = hydrateJsxNode(jsxNode, {
        jsxSegmentName,
        parentSegmentEnt,
        domPointer: {parent: parentDomPointer.parent, nodeCount},
        parentHNode,
        globalCtx,
        areaCtx,
      });

      hNodes.push(result.hNode);
      nodeCount += result.nodeCount;
    },
  });

  return {hNodes, nodeCount: nodeCount - nodeCountInit};
}
