import {GlobalCtx} from '../../../global-ctx/global-ctx.ts';
import {HNodeBase, HNodeCtx, PropsHNode} from '../../../h-node/h-node.ts';
import {JsxSegment} from '../../../jsx-path/jsx-path.ts';
import {DomPointer} from '../../../types.ts';
import {InsertedDomNodes} from '../../../utils/inserted-dom.ts';

export class HNodeText extends HNodeBase {
  domPointer: DomPointer;
  start: number;
  finish: number;
  constructor(
    props: PropsHNode,
    {
      domPointer,
      start,
      finish,
    }: {domPointer: DomPointer; start: number; finish: number}
  ) {
    super(props);
    this.domPointer = domPointer;
    this.start = start;
    this.finish = finish;
  }
}

export const hydrateDynamicText = ({
  text,
  domPointer,
  insertedDomNodes,
  jsxSegment,
  globalCtx,
  hNodeCtx,
}: {
  text: string;
  domPointer: DomPointer;
  insertedDomNodes: InsertedDomNodes;
  jsxSegment: JsxSegment;
  globalCtx: GlobalCtx;
  hNodeCtx: HNodeCtx;
}) => {
  let textPadding = 0;
  for (let i = insertedDomNodes.length; i >= 0; i--) {
    const insertedDomNode = insertedDomNodes[i];
    if (insertedDomNode.type !== 'text') {
      break;
    }

    textPadding += insertedDomNode.length;
  }

  const hNode = new HNodeText(
    {
      jsxSegment,
      globalCtx,
      hNodeCtx,
    },
    {
      domPointer: domPointer,
      start: textPadding,
      finish: textPadding + text.length,
    }
  );

  return hNode;
};
