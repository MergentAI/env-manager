import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig } from '../config';

export const statusCommand = async () => {
  const config = await loadConfig();
  if (!config) {
    console.error('No configuration found. Please run "easyenvmanager init" first.');
    process.exit(1);
  }

  const { serverUrl, project, environment, secretKey } = config;
  const statusUrl = `${serverUrl}/api/projects/${project}/env/${environment}/status`;
  const envPath = path.resolve(process.cwd(), '.env');

  console.log(`Checking status for ${project}:${environment} on ${serverUrl}...`);

  try {
    const response = await axios.get(statusUrl, {
      headers: {
        'x-api-key': secretKey,
      },
    });

    const { lastModified } = response.data;
    const serverDate = lastModified ? new Date(lastModified) : null;
    
    // Check local .env file
    let localDate: Date | null = null;
    try {
      if (await fs.pathExists(envPath)) {
        const stats = await fs.stat(envPath);
        localDate = stats.mtime;
      }
    } catch (e) {
      // Ignore error, treat as not existing
    }

    if (!serverDate) {
      console.log('⚠️  Remote environment has no last modified date.');
      return;
    }

    if (!localDate) {
      console.log('⚠️  Local .env file is missing.');
      console.log(`   Remote last modified: ${serverDate.toLocaleString()}`);
      console.log('   Run "easyenvmanager pull" to fetch variables.');
      return;
    }

    // Compare: If server is newer than local file
    if (serverDate > localDate) {
      console.log('❌ Out of sync.');
      console.log(`   Remote last modified: ${serverDate.toLocaleString()}`);
      console.log(`   Local .env modified:  ${localDate.toLocaleString()}`);
      console.log('   Run "easyenvmanager pull" to update.');
    } else {
      console.log('✅ Up to date.');
      console.log(`   Local .env modified: ${localDate.toLocaleString()}`);
    }

  } catch (error: any) {
    if (error.response && error.response.status === 404) {
       console.error(`❌ Environment '${environment}' not found on server.`);
    } else {
       console.error('Failed to check status:', error.message);
    }
    process.exit(1);
  }
};
