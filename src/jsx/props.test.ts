import {describe, expect, it} from 'bun:test';
import {separateProps} from './props.ts';

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

  it('className переименовывается в class', () => {
    const {userProps} = separateProps({className: 'box'});

    expect(userProps).toEqual({class: 'box'});
  });
});
