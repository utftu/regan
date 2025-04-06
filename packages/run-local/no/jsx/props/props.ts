import {Props, SystemProps} from '../../types.ts';

const detectSystemProps = (key: string) => {
  if (key === 'key' || key === 'ref' || key.startsWith('r_')) {
    return true;
  }

  return false;
};

const renameSystemProps = (key: string) => {
  if (key === 'key' || key === 'ref') {
    return key;
  }
  return key.slice(2);
};

export const separateProps = (
  rawProps: any
): {userProps: Props; systemProps: SystemProps} => {
  const ents = Object.entries(rawProps);

  let system = false;
  for (const [key] of ents) {
    if (detectSystemProps(key)) {
      system = true;
      break;
    }
  }

  if (system === false) {
    return {
      userProps: rawProps,
      systemProps: {},
    };
  }

  return ents.reduce<{
    systemProps: Record<string, any>;
    userProps: Record<string, any>;
  }>(
    (store, [key, value]) => {
      if (detectSystemProps(key) === true) {
        store.systemProps[renameSystemProps(key)] = value;
      } else {
        store.userProps[key] = value;
      }
      return store;
    },
    {userProps: {}, systemProps: {}}
  );
};
