import {describe, expect, it} from 'bun:test';
import {JSDOM} from 'jsdom';
import {HNodeComponent} from './component.ts';
import {HNodeElement} from './element.ts';
import {HNodeText} from './text.ts';
import {findPrevDomNode, getTopHNodeElement} from './find.ts';
import {addChildren} from './helpers.ts';

const jsdom = new JSDOM();
const {document} = jsdom.window;

const createComponent = () => new HNodeComponent({} as any);

const createElement = (id: string) => {
  const element = document.createElement('div');
  element.id = id;

  return new HNodeElement({} as any, {element} as any);
};

const createText = (text: string) =>
  new HNodeText({} as any, {text, textNode: document.createTextNode(text)});

describe('findPrevDomNode', () => {
  it('слева ничего нет', () => {
    const root = createComponent();
    const child = createComponent();
    addChildren(root, [child]);

    const {domNode, lastParentHNode} = findPrevDomNode(child);

    expect(domNode).toBeUndefined();
    expect(lastParentHNode).toBe(root);
  });

  it('соседний элемент слева', () => {
    const root = createComponent();
    const left = createElement('left');
    const target = createComponent();
    addChildren(root, [left, target]);

    expect(findPrevDomNode(target).domNode).toBe(left.element);
  });

  it('текст слева тоже годится', () => {
    const root = createComponent();
    const left = createText('раз');
    const target = createComponent();
    addChildren(root, [left, target]);

    expect(findPrevDomNode(target).domNode).toBe(left.textNode);
  });

  it('спускается в соседа за последним dom-узлом', () => {
    const root = createComponent();
    const left = createComponent();
    const deep = createComponent();
    const first = createElement('first');
    const last = createElement('last');
    addChildren(deep, [first, last]);
    addChildren(left, [deep]);
    const target = createComponent();
    addChildren(root, [left, target]);

    expect(findPrevDomNode(target).domNode).toBe(last.element);
  });

  it('элемент-родитель — граница обхода', () => {
    const outerLeft = createElement('outer-left');
    const parent = createElement('parent');
    const target = createComponent();
    addChildren(parent, [target]);

    const root = createComponent();
    addChildren(root, [outerLeft, parent]);

    const {domNode, lastParentHNode} = findPrevDomNode(target);

    expect(domNode).toBeUndefined();
    expect(lastParentHNode).toBe(parent);
  });
});

describe('getTopHNodeElement', () => {
  it('ближайший элемент вверх', () => {
    const element = createElement('box');
    const middle = createComponent();
    const leaf = createComponent();
    addChildren(element, [middle]);
    addChildren(middle, [leaf]);

    expect(getTopHNodeElement(leaf)).toBe(element);
  });

  it('элементов выше нет', () => {
    expect(getTopHNodeElement(createComponent())).toBeUndefined();
  });
});
