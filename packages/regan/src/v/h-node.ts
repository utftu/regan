import {HNodeBase, PropsHNode} from '../h-node/h-node.ts';
import {JsxNodeElement} from '../node/variants/element/element.ts';
import {VTextNew} from './new.ts';

type Parent = {
  parent: HNodeBase;
  position: number;
};

type Init = (element: HTMLElement) => void;

export class HNodeElementToReplace extends HNodeBase {
  jsxNode: JsxNodeElement;
  init: Init;

  constructor(
    propsFirst: PropsHNode,
    {init, jsxNode}: {init: Init; jsxNode: JsxNodeElement}
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
