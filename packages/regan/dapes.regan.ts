import {getAbsolutePath, Group, publishPackage, startIfMain, Task} from 'dapes';

const currentDir = getAbsolutePath('.', import.meta);
console.log('currentDir', currentDir);

const types = new Task({
  name: 'types',
  exec: async ({command}) => {
    await command('npm run types', {cwd: currentDir});
  },
});

export const buildRegan = new Task({
  name: 'build',
  parents: [types],
  exec: async ({command}) => {
    await command('npm run build', {cwd: currentDir});
  },
});

const publish = new Task({
  name: 'publish',
  parents: [buildRegan],
  exec: async ({ctx}) => {
    await publishPackage({
      pathToPackage: getAbsolutePath('./package.json', import.meta),
      version: 'patch',
      ctx,
    });
  },
});

export const reganGroup = new Group({
  name: 'regan',
  tasks: [buildRegan, types, publish],
});

await startIfMain(reganGroup, import.meta);
