import { Command, ux } from '@oclif/core';
import { integrationSchema } from '@smarttask-platform/core';

export default class Validate extends Command {
  static description = 'Validate the integration.';

  async run(): Promise<void> {
    ux.action.start('Validating local integration');
    ux.action.stop();
  }
}
