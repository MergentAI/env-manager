import fs from 'fs-extra';
import path from 'path';

const CONFIG_FILE = '.envmanager.json';

export interface LocalConfig {
  serverUrl: string;
  project: string;
  environment: string;
  secretKey?: string;
  lastSynced?: string;
}

export const loadConfig = async (): Promise<LocalConfig | null> => {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);
  if (await fs.pathExists(configPath)) {
    return fs.readJson(configPath);
  }
  return null;
};

export const saveConfig = async (config: LocalConfig): Promise<void> => {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
};

export const updateLastSynced = async (timestamp: string): Promise<void> => {
  const config = await loadConfig();
  if (config) {
    config.lastSynced = timestamp;
    await saveConfig(config);
  }
};
