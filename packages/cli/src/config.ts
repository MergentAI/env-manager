import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const GLOBAL_CONFIG_FILE = path.join(os.homedir(), '.envmanager', 'config.json');
const LOCAL_CONFIG_FILE = '.envmanager.json';

export interface GlobalConfig {
  serverUrl: string;
  secretKey: string;
}

export interface LocalConfig {
  project: string;
  environment: string;
  lastSynced?: string;
}

export interface MergedConfig extends GlobalConfig, LocalConfig {}

// Global Config
export const saveGlobalConfig = async (config: GlobalConfig): Promise<void> => {
  await fs.ensureDir(path.dirname(GLOBAL_CONFIG_FILE));
  await fs.writeJson(GLOBAL_CONFIG_FILE, config, { spaces: 2 });
};

export const loadGlobalConfig = async (): Promise<GlobalConfig | null> => {
  if (await fs.pathExists(GLOBAL_CONFIG_FILE)) {
    return fs.readJson(GLOBAL_CONFIG_FILE);
  }
  return null;
};

// Local Config
export const saveLocalConfig = async (config: LocalConfig): Promise<void> => {
  const configPath = path.resolve(process.cwd(), LOCAL_CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
};

export const loadLocalConfig = async (): Promise<LocalConfig | null> => {
  const configPath = path.resolve(process.cwd(), LOCAL_CONFIG_FILE);
  if (await fs.pathExists(configPath)) {
    return fs.readJson(configPath);
  }
  return null;
};

// Merged Config (what commands consume)
export const loadConfig = async (): Promise<MergedConfig | null> => {
  const globalConfig = await loadGlobalConfig();
  const localConfig = await loadLocalConfig();

  if (!globalConfig || !localConfig) {
    return null;
  }

  return {
    ...globalConfig,
    ...localConfig,
  };
};

export const updateLastSynced = async (timestamp: string): Promise<void> => {
  const localConfig = await loadLocalConfig();
  if (localConfig) {
    localConfig.lastSynced = timestamp;
    await saveLocalConfig(localConfig);
  }
};
