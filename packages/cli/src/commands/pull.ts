import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, updateLastSynced } from '../config';

const ENV_FILE = '.env';

export const pullCommand = async () => {
  const config = await loadConfig();
  if (!config) {
    console.error('No configuration found. Please run "envmanager init" first.');
    process.exit(1);
  }

  try {
    const { serverUrl, project, environment, secretKey } = config;
    const url = `${serverUrl}/api/projects/${project}/env/${environment}`;
    
    console.log(`Fetching environment variables from ${url}...`);

    const response = await axios.get(url, {
      headers: {
        'x-api-key': secretKey,
      },
    });

    const { lastModified, variables } = response.data;
    
    if (!variables) {
      console.error('No variables found in server response.');
      process.exit(1);
    }

    let envContent = '';
    for (const [key, value] of Object.entries(variables)) {
      envContent += `${key}=${value}\n`;
    }

    await fs.writeFile(path.resolve(process.cwd(), ENV_FILE), envContent);
    console.log(`.env file updated successfully.`);
    
    if (lastModified) {
      await updateLastSynced(lastModified);
    }

  } catch (error: any) {
    if (error.response) {
      console.error(`Server responded with error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data && error.response.data.error) {
        console.error(`Message: ${error.response.data.error}`);
      }
    } else if (error.request) {
      console.error('No response received from server.');
    } else {
      console.error('Error setting up request:', error.message);
    }
    process.exit(1);
  }
};
