import {Group, publishPackage, startIfMain, Task} from 'dapes';
import {reganGroup} from './packages/regan/dapes.regan.ts';
import {viteGroup} from 'regan-vite/dapes.vite.ts';

const types = new Task({
  name: 'types',
  exec: async ({command}) => {
    await command('npm run types');
  },
});

const build = new Task({
  name: 'build',
  parents: [types],
  exec: async ({command}) => {
    await command('npm run build');
  },
});

const publish = new Task({
  name: 'publish',
  parents: [build],
  exec: async ({ctx}) => {
    await publishPackage({
      pathToPackage: './package.json',
      version: 'patch',
      ctx,
    });
  },
});

const group = new Group({
  name: '',
  tasks: [build, types, publish],
  subgroups: [reganGroup, viteGroup],
});

await startIfMain(group, import.meta);
