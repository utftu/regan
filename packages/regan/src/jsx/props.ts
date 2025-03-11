import {Props, SystemProps} from '../types.ts';

type SystemPropsKey = keyof SystemProps;

const detectSystemProps = (key: string) => {
  if (key === 'key' || key === 'ref' || key.startsWith('r_')) {
    return true;
  }

  return false;
};

const renameSystemProps = (key: string): SystemPropsKey => {
  if (key === 'key' || key === 'ref') {
    return key;
  }
  return key.slice(2) as SystemPropsKey;
};

export const separateProps = (rawProps: Props) => {
  const userProps: Props = {};
  const systemProps: SystemProps = {};
  for (const key in rawProps) {
    if (detectSystemProps(key)) {
      systemProps[renameSystemProps(key)] = rawProps[key];
    } else {
      userProps[key] = rawProps[key];
    }
  }

  return {userProps, systemProps};
};
