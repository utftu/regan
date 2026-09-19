import {Group, publishPackage, startIfMain, Task} from 'dapes';

const types = new Task({
  name: 'types',
  exec: async ({command}) => {
    await command('bun run types');
  },
});

const build = new Task({
  name: 'build',
  parents: [types],
  exec: async ({command}) => {
    await command('bun run build');
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
});

await startIfMain(group, import.meta);
