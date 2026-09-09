import {getAbsolutePath, Group, publishPackage, startIfMain, Task} from 'dapes';

const currentDir = getAbsolutePath('.', import.meta);

const buildVite = new Task({
  name: 'build',
  exec: async ({command}) => {
    await command('bun run build', {cwd: currentDir});
  },
});

const publish = new Task({
  name: 'publish',
  parents: [buildVite],
  exec: async ({ctx}) => {
    await publishPackage({
      pathToPackage: getAbsolutePath('./package.json', import.meta),
      version: 'patch',
      ctx,
    });
  },
});

export const viteGroup = new Group({
  name: 'regan-vite',
  tasks: [buildVite, publish],
});

await startIfMain(viteGroup, import.meta);
