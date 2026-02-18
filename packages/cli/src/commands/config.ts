import inquirer from 'inquirer';
import axios from 'axios';
import { saveGlobalConfig } from '../config';

export const configCommand = async () => {
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
      message: 'Enter your Admin Secret Key:',
    },
  ]);

  const { serverUrl, secretKey } = answers;

  // Validate Connection
  console.log('Testing connection...');
  try {
    await axios.get(`${serverUrl}/api/projects`, {
      headers: { 'x-api-key': secretKey },
    });
    console.log('✅ Connection successful!');
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.error('❌ Authentication failed. Please check your Secret Key.');
    } else {
      console.error('❌ Failed to connect to server. Please check the URL.');
    }
    // We save anyway, but warn the user.
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save',
        message: 'Do you want to save this configuration anyway?',
        default: false,
      },
    ]);
    if (!confirm.save) return;
  }

  await saveGlobalConfig({ serverUrl, secretKey });
  console.log('Configuration saved globally.');
};
