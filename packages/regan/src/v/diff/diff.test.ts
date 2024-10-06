import {describe, expect, it} from 'vitest';
import {VElementNew, VNew} from '../new.ts';
import {VElementOld, VOld, VTextOld} from '../old.ts';
import {EventDiffPatchElement, diffOne} from './diff.ts';

describe('v/diffOne', () => {
  it('delete', () => {
    const vNew = undefined;
    const vOld = {
      type: 'text',
      text: 'hello',
      start: 0,
      domNode: null as any,
    } satisfies VOld;

    const event = diffOne(vNew, vOld);
    expect(event.type).toBe('delete');
  });
  it('create', () => {
    const vNew = {
      type: 'text',
      text: 'hello',
      start: 0,
    } satisfies VNew;
    const vOld = undefined;

    const event = diffOne(vNew, vOld);
    expect(event.type).toBe('create');
  });
  it('replaceFull', () => {
    const vNew = {
      type: 'text',
      text: 'hello',
      start: 0,
    } satisfies VNew;
    const vOld = {
      type: 'element',
      props: {},
      children: [],
      tag: 'div',
      domNode: null as any,
      dynamicProps: {},
    } satisfies VElementOld;

    const event = diffOne(vNew, vOld);
    expect(event.type).toBe('replaceFull');
  });
  it('nextText', () => {
    const vNew = {
      type: 'text',
      text: 'hello',
      start: 0,
    } satisfies VNew;
    const vOld = {...vNew, domNode: null as any};

    const event = diffOne(vNew, vOld);
    expect(event.type).toBe('nextText');
  });
  it('nextText', () => {
    const vNew = {
      type: 'text',
      text: 'hello',
      start: 0,
    } satisfies VNew;
    const vOld = {
      type: 'text',
      text: 'world',
      start: 0,
      domNode: null as any,
    } satisfies VTextOld;

    const event = diffOne(vNew, vOld);
    expect(event.type).toBe('replaceText');
  });
  it('replaceFull tags', () => {
    const vNew = {
      type: 'element',
      props: {
        newProps: 'new',
        replace: 'new',
      },
      children: [],
      tag: 'div',
    } satisfies VElementNew;
    const vOld = {
      type: 'element',
      props: {
        replace: 'old',
        oldProps: 'old',
      },
      children: [],
      tag: 'div',
      domNode: null as any,
      dynamicProps: {},
    } satisfies VElementOld;

    const event = diffOne(vNew, vOld) as EventDiffPatchElement;
    expect(event.type).toBe('patchElement');
    expect(Object.keys(event.newProps).length).toBe(2);
    expect(event.newProps.newProps).toBe('new');
    expect(event.newProps.replace).toBe('new');
    expect(Object.keys(event.oldProps).length).toBe(2);
    expect(event.oldProps.oldProps).toBe('old');
    expect(event.oldProps.replace).toBe('old');
  });
});
