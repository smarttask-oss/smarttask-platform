import { Command } from '@oclif/core';
import { build } from '../../utils';

export default class Deploy extends Command {
  static description = 'Build and deploy the integration from the current directory.';

  async run(): Promise<void> {
    const cwd = process.cwd();
    await build(cwd);
  }
}
