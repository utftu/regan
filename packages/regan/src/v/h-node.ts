import {HNodeBase, PropsHNode} from '../h-node/h-node.ts';
import {HNodeText} from '../h-node/text.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {VTextNew} from './new.ts';

type Parent = {
  parent: HNodeBase;
  position: number;
};

type InitElement = (element: HTMLElement) => void;
export type InitText = (textNode: Text) => void;

export class HNodeElementToReplace extends HNodeBase {
  jsxNode: JsxNodeElement;
  init: InitElement;

  constructor(
    propsFirst: PropsHNode,
    {init, jsxNode}: {init: InitElement; jsxNode: JsxNodeElement}
  ) {
    super(propsFirst);
    this.init = init;
    this.jsxNode = jsxNode;
  }
}

export class HNodeTextToReplace extends HNodeBase {
  jsxNode: JsxNodeElement;
  init: InitText;

  constructor(
    propsFirst: PropsHNode,
    {init, jsxNode}: {init: InitText; jsxNode: JsxNodeElement}
  ) {
    super(propsFirst);
    this.init = init;
    this.jsxNode = jsxNode;
  }
}

export class HNodeVText extends HNodeBase {
  start: number;
  finish: number;

  constructor(
    props: PropsHNode,
    {
      parentEnt,
      vText,
      start,
      finish,
    }: {
      parentEnt: Parent;
      vText: VTextNew;
      start: number;
      finish: number;
    }
  ) {
    super(props);
    this.parentEnt = parentEnt;
    this.vText = vText;
    this.start = start;
    this.finish = finish;
  }

  parentEnt?: Parent;
  vText: VTextNew;
}
