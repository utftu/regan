import {getAbsolutePath, Group, startIfMain, Task} from 'dapes';
import {astroGroup} from '../regan-astro/dapes.astro.ts';

const currentDir = getAbsolutePath('.', import.meta);

const dev = new Task({
  name: 'dev',
  parents: [astroGroup.getTaskControl('build')],
  exec: async ({command}) => {
    await command('npm run dev', {cwd: currentDir});
  },
});

export const astroRunGroup = new Group({
  name: 'astro-run',
  tasks: [dev],
});

await startIfMain(astroRunGroup, import.meta);
