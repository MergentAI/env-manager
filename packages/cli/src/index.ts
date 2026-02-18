import { Command } from 'commander';
import { initCommand } from './commands/init';
import { pullCommand } from './commands/pull';
import { syncCommand } from './commands/sync';
import { statusCommand } from './commands/status';

const program = new Command();

program
  .name('envmanager')
  .description('CLI for Env Manager')
  .version('1.0.0');

program.command('init')
  .description('Initialize local configuration')
  .action(initCommand);

program.command('pull')
  .description('Force pull environment variables')
  .action(pullCommand);

program.command('sync')
  .description('Check for updates and pull if necessary')
  .action(syncCommand);

program.command('status')
  .description('Check status of environment variables without pulling')
  .action(statusCommand);

program.parse();
