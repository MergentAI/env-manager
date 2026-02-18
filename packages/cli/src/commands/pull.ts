import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, updateLastSynced } from '../config';

const ENV_FILE = '.env';

export const pullCommand = async (options: { force?: boolean }) => {
  const config = await loadConfig();
  if (!config) {
    console.error('❌ No configuration found. Please run "envmanager init" first.');
    process.exit(1);
  }

  const { serverUrl, project, environment, secretKey, lastSynced } = config;
  const url = `${serverUrl}/api/projects/${project}/env/${environment}`;
  
  // Smart Sync Check (unless forced)
  if (!options.force && lastSynced) {
    try {
      const statusUrl = `${url}/status`;
      const statusRes = await axios.get(statusUrl, { headers: { 'x-api-key': secretKey } });
      const { lastModified } = statusRes.data;

      if (lastModified && new Date(lastModified) <= new Date(lastSynced)) {
        console.log('✅ Environment variables are already up to date.');
        return;
      }
      console.log('🔄 Updates detected. Pulling changes...');
    } catch (err) {
      // If status check fails, proceed to pull anyway
    }
  } else if (options.force) {
    console.log('⚠️  Force pull enabled. Overwriting local changes...');
  }

  console.log(`Fetching environment variables from ${url}...`);

  try {
    const response = await axios.get(url, {
      headers: {
        'x-api-key': secretKey,
      },
    });

    const { lastModified, variables } = response.data;
    
    if (!variables) {
      console.error('❌ No variables found in server response.');
      process.exit(1);
    }

    let envContent = '';
    for (const [key, value] of Object.entries(variables)) {
      envContent += `${key}=${value}\n`;
    }

    await fs.writeFile(path.resolve(process.cwd(), ENV_FILE), envContent);
    console.log(`✅ .env file updated successfully.`);
    
    if (lastModified) {
      await updateLastSynced(lastModified);
    }

  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Server error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data && error.response.data.error) {
        console.error(`   Message: ${error.response.data.error}`);
      }
    } else {
      console.error('❌ Error fetching variables:', error.message);
    }
    process.exit(1);
  }
};
