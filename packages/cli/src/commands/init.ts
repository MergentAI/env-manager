import inquirer from 'inquirer';
import { saveConfig } from '../config';

export const initCommand = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverUrl',
      message: 'Enter the Env Manager Server URL:',
      default: 'http://localhost:3000',
    },
    {
      type: 'input',
      name: 'secretKey',
      message: 'Enter the Env Manager Secret Key:',
    },
    {
      type: 'input',
      name: 'project',
      message: 'Enter the Project Name:',
    },
    {
      type: 'input',
      name: 'environment',
      message: 'Enter the Environment (e.g., local, prod):',
      default: 'local',
    },
  ]);

  await saveConfig({
    serverUrl: answers.serverUrl,
    project: answers.project,
    environment: answers.environment,
    secretKey: answers.secretKey,
    lastSynced: undefined,
  });

  console.log('Configuration saved to .envmanager.json');
};
