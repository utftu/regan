import {HNode} from '../h-node/h-node.ts';
import {InitText} from './h-node.ts';

export type VNew = VElementNew | VTextNew;

export type VElementNew = {
  type: 'element';
  tag: string;

  props: Record<string, any>;

  children: VNew[];

  init?: (element: HTMLElement) => void;
};

export type VTextNew = {
  type: 'text';
  text: string;
  start: number;

  inits: InitText[];
};

export type VTextPartlyNew = VTextNew & {
  hNode: HNode;
};
