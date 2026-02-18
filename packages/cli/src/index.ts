import { Command } from 'commander';
import { initCommand } from './commands/init';
import { pullCommand } from './commands/pull';
import { statusCommand } from './commands/status';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('envmanager')
  .description('CLI for Env Manager')
  .version('1.0.0');

program.command('config')
  .description('Set global configuration (Server URL, Secret Key)')
  .action(configCommand);

program.command('init')
  .description('Initialize local project configuration')
  .action(initCommand);

program.command('pull')
  .description('Pull environment variables')
  .option('-f, --force', 'Force update regardless of timestamps', false)
  .action(pullCommand);

program.command('status')
  .description('Check status of environment variables without pulling')
  .action(statusCommand);

program.parse();
