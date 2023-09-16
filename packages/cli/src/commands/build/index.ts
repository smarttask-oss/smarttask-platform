import { Command } from '@oclif/core';
import { build } from '../../utils/index';

export default class Build extends Command {
  static description = 'Build the integration from the current directory.';

  async run() {
    const cwd = process.cwd();
    await build({ directory: cwd, output: 'output' });
  }
}
