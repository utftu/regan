import {describe, it, expect, vi} from 'vitest';
import {
  convertTextNewToOld,
  convertElementNewToOld,
  convertFromNewToOld,
} from './convert.ts';
import {VNewElement, VNewText, VOldElement, VOldText} from './types.ts';

const createTextNode = (text: string = '') => ({text} as any as Text);
const createElementNode = (tag: string = 'div') => ({tagName: tag} as Element);

const createVNewText = (init?: (vOld: VOldText) => void): VNewText =>
  ({
    type: 'text',
    init,
  } as VNewText);

const createVNewElement = (init?: (vOld: VOldElement) => void): VNewElement =>
  ({
    type: 'element',
    init,
  } as VNewElement);

describe('convert', () => {
  describe('convertFromNewToOld', () => {
    it('text', () => {
      const textNode = createTextNode('hello');
      const vNew = createVNewText();
      const spyInit = vi.fn();
      vNew.init = spyInit;

      const vOld = convertFromNewToOld(vNew, textNode);

      expect(vOld.textNode).toBe(textNode);
      expect(spyInit).toHaveBeenCalledWith(vNew);
    });

    it('element conversion', () => {
      const elementNode = createElementNode('div');
      const vNew = createVNewElement();
      const spyInit = vi.fn();
      vNew.init = spyInit;

      const vOld = convertFromNewToOld(vNew, elementNode);

      expect(vOld.element).toBe(elementNode);
      expect(spyInit).toHaveBeenCalledWith(vNew);
    });
  });

  describe('convertTextNewToOld', () => {
    it('text node assign', () => {
      const textNode = createTextNode('test');
      const vNew = createVNewText();
      const vOld = convertTextNewToOld(vNew, textNode);
      expect(vOld.textNode).toBe(textNode);
    });

    it('init call', () => {
      const textNode = createTextNode('test');
      const spyInit = vi.fn();
      const vNew = createVNewText(spyInit);
      convertTextNewToOld(vNew, textNode);
      expect(spyInit).toHaveBeenCalledWith(vNew);
    });
  });

  describe('convertElementNewToOld', () => {
    it('element assign', () => {
      const elementNode = createElementNode('span');
      const vNew = createVNewElement();
      const vOld = convertElementNewToOld(vNew, elementNode);
      expect(vOld.element).toBe(elementNode);
    });

    it('init call', () => {
      const elementNode = createElementNode('span');
      const spyInit = vi.fn();
      const vNew = createVNewElement(spyInit);
      convertElementNewToOld(vNew, elementNode);
      expect(spyInit).toHaveBeenCalledWith(vNew);
    });
  });
});
