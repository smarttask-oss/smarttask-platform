import { Args, Command, ux } from '@oclif/core';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';

export default class Init extends Command {
  static description = 'Initialize a new integration with a template.';

  static args = {
    name: Args.string({
      name: 'name',
      required: true,
      description: 'The directory of the integration, if the directory already exists the command will fail',
    }),
  };

  static examples = ['smarttask init MyIntegration'];

  async run(): Promise<void> {
    const cwd = process.cwd();
    const { args } = await this.parse(Init);
    const dir = resolve(cwd, args.name);
    ux.action.start(`Creating integration in ${dir}`);
    if (existsSync(dir)) {
      ux.action.stop('❌ the directory already exists');
      this.logToStderr(
        'The directory already exists. Use another name or remove the current directory and try again!'
      );
      return;
    }

    await mkdir(dir);
    ux.action.stop('✅ done');
  }
}
