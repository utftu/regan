import {Props, SystemProps} from '../types.ts';

type SystemPropsKey = keyof SystemProps;

const systemPropsNames: SystemPropsKey[] = ['key', 'ref', 'rawHtml'];

const detectSystemProps = (key: string): key is SystemPropsKey => {
  return systemPropsNames.includes(key as SystemPropsKey);
};

export const separateProps = (rawProps: Props) => {
  const userProps: Props = {};
  const systemProps: SystemProps = {};
  for (const key in rawProps) {
    const value = rawProps[key];
    if (detectSystemProps(key)) {
      systemProps[key] = value;
    } else {
      userProps[key] = value;
    }
  }

  return {userProps, systemProps};
};
