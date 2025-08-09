import {getAbsolutePath, Group, publishPackage, startIfMain, Task} from 'dapes';
import {reganGroup} from '../regan/dapes.regan.ts';

const currentDir = getAbsolutePath('.', import.meta);

const types = new Task({
  name: 'types',
  exec: async ({command}) => {
    await command('npm run types', {cwd: currentDir});
  },
});

const build = new Task({
  name: 'build',
  parents: [reganGroup.getTaskControl('build'), types],
  exec: async ({command}) => {
    await command('npm run build', {cwd: currentDir});
  },
});

const publish = new Task({
  name: 'publish',
  parents: [build],
  exec: async ({ctx}) => {
    await publishPackage({
      pathToPackage: getAbsolutePath('./package.json', import.meta),
      version: 'patch',
      ctx,
    });
  },
});

export const viteGroup = new Group({
  name: 'vite',
  tasks: [build, types, publish],
});

await startIfMain(viteGroup, import.meta);
