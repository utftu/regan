import {JsxNodeElement} from '../node/variants/element/element.ts';
import {DomPointer} from '../types.ts';
// import {VElemOld} from '../v/v.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';
import {DynamicPropsEnt} from '../utils/props/props.ts';

type HNodeElProps = {
  // domPointer: DomPointer;
  element: HTMLElement;
  jsxNode: JsxNodeElement;
  dynamicPropsEnt: DynamicPropsEnt;
};

export class HNodeElement extends HNodeBase {
  // domPointer: DomPointer;
  jsxNode: JsxNodeElement;
  dynamicPropsEnt: DynamicPropsEnt;
  element: HTMLElement;
  constructor(
    props: PropsHNode,
    {jsxNode, dynamicPropsEnt, element}: HNodeElProps
  ) {
    super(props);
    // this.domPointer = domPointer;
    this.jsxNode = jsxNode;
    this.dynamicPropsEnt = dynamicPropsEnt;
    this.element = element;
  }
}
