import {Atom} from 'strangelove';

export const splitProps = (props: Record<string, any>) => {
  const joinedProps: Record<string, any> = {};
  const dynamicProps: Record<string, any> = {};
  const staticProps: Record<string, any> = {};

  for (const key in props) {
    const value = props[key];
    if (value instanceof Atom) {
      const atomValue = value.get();
      joinedProps[key] = atomValue;
      dynamicProps[key] = value;
    } else {
      staticProps[key] = props[key];
    }
  }

  return {joinedProps, dynamicProps, staticProps};
};
