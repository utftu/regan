import {getAbsolutePath, Group, publishPackage, startIfMain, Task} from 'dapes';
import {viteGroup} from '../regan-vite/dapes.vite.ts';

const currentDir = getAbsolutePath('.', import.meta);

const types = new Task({
  name: 'types',
  exec: async ({command}) => {
    await command('npm run types', {cwd: currentDir});
  },
});

const build = new Task({
  name: 'build',
  parents: [viteGroup.getTaskControl('build'), types],
  exec: async ({command}) => {
    await command('npm run build-client', {cwd: currentDir});
    await command('npm run build-server', {cwd: currentDir});
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

export const astroGroup = new Group({
  name: 'astro',
  tasks: [build, types, publish],
});

await startIfMain(astroGroup, import.meta);
