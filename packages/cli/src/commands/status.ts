import axios from 'axios';
import { loadConfig } from '../config';

export const statusCommand = async () => {
  const config = await loadConfig();
  if (!config) {
    console.error('No configuration found. Please run "easyenvmanager init" first.');
    process.exit(1);
  }

  const { serverUrl, project, environment, secretKey, lastSynced } = config;
  const statusUrl = `${serverUrl}/api/projects/${project}/env/${environment}/status`;

  console.log(`Checking status for ${project}:${environment} on ${serverUrl}...`);

  try {
    const response = await axios.get(statusUrl, {
      headers: {
        'x-api-key': secretKey,
      },
    });

    const { lastModified } = response.data;
    const serverDate = lastModified ? new Date(lastModified) : null;
    const localDate = lastSynced ? new Date(lastSynced) : null;

    if (!serverDate) {
      console.log('⚠️  Remote environment has no last modified date.');
      return;
    }

    if (!localDate) {
      console.log('⚠️  Local environment has never been synced.');
      console.log(`   Remote last modified: ${serverDate.toLocaleString()}`);
      console.log('   Run "easyenvmanager pull" to fetch variables.');
      return;
    }

    if (serverDate > localDate) {
      console.log('❌ Out of sync.');
      console.log(`   Remote last modified: ${serverDate.toLocaleString()}`);
      console.log(`   Local last synced:    ${localDate.toLocaleString()}`);
      console.log('   Run "easyenvmanager pull" to update.');
    } else {
      console.log('✅ Up to date.');
      console.log(`   Last synced: ${localDate.toLocaleString()}`);
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
