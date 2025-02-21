import {LisneterManager} from '../utils/props/funcs.ts';
import {HNodeBase, PropsHNode} from './h-node.ts';

type HNodeElProps = {
  element: Element;
  listenerManager: LisneterManager;
};

export class HNodeElement extends HNodeBase {
  element: Element;
  listenerManager: LisneterManager;
  constructor(props: PropsHNode, {element, listenerManager}: HNodeElProps) {
    super(props);
    this.element = element;
    this.listenerManager = listenerManager;
  }
}
