import {describe, expect, it} from 'bun:test';
import {separateProps} from './props.ts';
import {createElement} from './jsx.ts';
import {JsxNodeElement} from '../jsx-node/jsx-node.ts';

describe('props', () => {
  it('системные пропы отделяются от пользовательских', () => {
    const ref = () => {};

    const {userProps, systemProps} = separateProps({
      a: 1,
      key: '2',
      ref,
      rawHtml: '<b>x</b>',
    });

    expect(userProps).toEqual({a: 1});
    expect(systemProps.key).toBe('2');
    expect(systemProps.ref).toBe(ref);
    expect(systemProps.rawHtml).toBe('<b>x</b>');
  });

  it('className переименовывается в class у тега', () => {
    const jsxNode = createElement('div', {className: 'box'}) as JsxNodeElement;

    expect(jsxNode.props).toEqual({class: 'box'});
  });

  it('у компонента className остаётся как есть', () => {
    const Component = () => null;
    const jsxNode = createElement(Component, {className: 'box', key: '1'});

    expect(jsxNode.props).toEqual({className: 'box'});
    expect(jsxNode.systemProps.key).toBe('1');
  });
});
