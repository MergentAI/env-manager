import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../data');

export interface EnvData {
  lastModified: string;
  variables: Record<string, string>;
}

export const getProjectEnv = async (project: string, env: string): Promise<EnvData | null> => {
  const filePath = path.join(DATA_DIR, project, `${env}.json`);
  if (!await fs.pathExists(filePath)) {
    return null;
  }
  return fs.readJson(filePath);
};

export const saveProjectEnv = async (project: string, env: string, variables: Record<string, string>): Promise<EnvData> => {
  const projectDir = path.join(DATA_DIR, project);
  await fs.ensureDir(projectDir);
  
  const filePath = path.join(projectDir, `${env}.json`);
  const data: EnvData = {
    lastModified: new Date().toISOString(),
    variables,
  };
  
  await fs.writeJson(filePath, data, { spaces: 2 });
  return data;
};

export const listProjects = async (): Promise<string[]> => {
  await fs.ensureDir(DATA_DIR);
  const items = await fs.readdir(DATA_DIR);
  const projects = [];
  
  for (const item of items) {
    const stat = await fs.stat(path.join(DATA_DIR, item));
    if (stat.isDirectory()) {
      projects.push(item);
    }
  }
  
  return projects;
};

export const listEnvironments = async (project: string): Promise<string[]> => {
  const projectDir = path.join(DATA_DIR, project);
  if (!await fs.pathExists(projectDir)) {
    return [];
  }
  
  const items = await fs.readdir(projectDir);
  return items
    .filter(item => item.endsWith('.json'))
    .map(item => item.replace('.json', ''));
};
