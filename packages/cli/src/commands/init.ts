import inquirer from 'inquirer';
import axios from 'axios';
import { saveLocalConfig, loadGlobalConfig } from '../config';

export const initCommand = async () => {
  const globalConfig = await loadGlobalConfig();
  if (!globalConfig) {
    console.error('❌ No global configuration found. Please run "easyenvmanager config" first.');
    process.exit(1);
  }

  const { serverUrl, secretKey } = globalConfig;

  // Fetch Projects
  let projects: string[] = [];
  try {
    const res = await axios.get(`${serverUrl}/api/projects`, {
      headers: { 'x-api-key': secretKey },
    });
    projects = res.data;
  } catch (err: any) {
    console.error('❌ Failed to fetch projects:', err.message);
    process.exit(1);
  }

  if (projects.length === 0) {
    console.warn('⚠️  No projects found on the server. Please create one via the dashboard first.');
    process.exit(0);
  }

  const projectAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Select a project:',
      choices: projects,
    },
  ]);
  const project = projectAnswer.project;

  // Fetch Environments for selected project
  let envs: string[] = [];
  try {
    const res = await axios.get(`${serverUrl}/api/projects/${project}/envs`, {
      headers: { 'x-api-key': secretKey },
    });
    envs = res.data;
  } catch (err: any) {
    console.error(`❌ Failed to fetch environments for project '${project}':`, err.message);
    process.exit(1);
  }

  if (envs.length === 0) {
    console.warn(`⚠️  No environments found for project '${project}'. Please create one via the dashboard first.`);
    process.exit(0);
  }

  const envAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'Select an environment:',
      choices: envs,
    },
  ]);

  await saveLocalConfig({
    project: project,
    environment: envAnswer.environment,
    lastSynced: undefined,
  });

  console.log(`✅ Project '${project}' initialized locally. Run 'easyenvmanager pull' to fetch variables.`);
};
