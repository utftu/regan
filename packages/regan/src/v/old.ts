import {DynamicPropsEnts} from '../utils/props/props.ts';
import {VElementNew, VTextNew} from './new.ts';

export type VElementOld = VElementNew & {
  domNode: HTMLElement;
  dynamicProps: DynamicPropsEnts;
  children: VOld[];
};

export type VTextOld = VTextNew & {
  domNode: Node;
};

export type VOld = VElementOld | VTextOld;
