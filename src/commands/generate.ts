import 'reflect-metadata';
import { Command } from '@oclif/core';
import { help, configPath, brokerApiUrl, brokerToken } from '../flags';
import { TYPES } from '../inversify.types';
import { bindBroker, bindConfigPath, vsContainer } from '../inversify.config';
import { GenerateController } from '../broker/generate.contoller';

/**
 * Generate role file command
 */
export default class Generate extends Command {
  static description = 'Generates configuration file from template.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    ...help,
    ...brokerApiUrl,
    ...brokerToken,
    ...configPath,
  };

  /**
   * Run the command
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(Generate);

    bindConfigPath(flags['config-path']);

    bindBroker(flags['broker-api-url'], flags['broker-token']);

    this.log(`Generate integration file`);

    await vsContainer
      .get<GenerateController>(TYPES.GenerateController)
      .generate();
  }
}
