import axios from 'axios';
import { loadConfig } from '../config';
import { pullCommand } from './pull';

export const syncCommand = async () => {
  const config = await loadConfig();
  if (!config) {
    console.error('No configuration found. Please run "envmanager init" first.');
    process.exit(1);
  }

  const { serverUrl, project, environment, secretKey, lastSynced } = config;
  const statusUrl = `${serverUrl}/api/projects/${project}/env/${environment}/status`;

  console.log(`Checking for updates on ${statusUrl}...`);

  try {
    const response = await axios.get(statusUrl, {
      headers: {
        'x-api-key': secretKey,
      },
    });

    const { lastModified } = response.data;

    if (!lastSynced || (lastModified && new Date(lastModified) > new Date(lastSynced))) {
      console.log('Environment variables have changed. Pulling updates...');
      await pullCommand();
    } else {
      console.log('Environment variables are up to date.');
    }

  } catch (error: any) {
    console.error('Failed to check status:', error.message);
    process.exit(1);
  }
};
