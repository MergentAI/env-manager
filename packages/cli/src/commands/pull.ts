import axios from "axios";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import inquirer from "inquirer";
import { loadConfig } from "../config";

const ENV_FILE = ".env";

// Helper to compare environment variables
const areEnvVarsEqual = (
  local: Record<string, string>,
  remote: Record<string, string>,
): boolean => {
  const localKeys = Object.keys(local).sort();
  const remoteKeys = Object.keys(remote).sort();

  // Check keys length
  if (localKeys.length !== remoteKeys.length) return false;

  // Check keys and values
  for (let i = 0; i < localKeys.length; i++) {
    const key = localKeys[i];
    if (key !== remoteKeys[i]) return false;
    if (local[key] !== remote[key]) return false;
  }

  return true;
};

export const pullCommand = async (options: { force?: boolean }) => {
  const config = await loadConfig();
  if (!config) {
    console.error(
      '❌ No configuration found. Please run "easyenvmanager init" first.',
    );
    process.exit(1);
  }

  const { serverUrl, project, environment, secretKey } = config;
  const url = `${serverUrl}/api/projects/${project}/env/${environment}`;
  const envPath = path.resolve(process.cwd(), ENV_FILE);

  console.log(`Fetching environment variables from ${url}...`);

  try {
    // 1. Fetch Remote Variables
    const response = await axios.get(url, {
      headers: {
        "x-api-key": secretKey,
      },
    });

    const { variables: remoteVars, lastModified } = response.data;

    if (!remoteVars) {
      console.error("❌ No variables found in server response.");
      process.exit(1);
    }

    // 2. Prepare Remote Content String
    let remoteEnvContent = "";
    for (const [key, value] of Object.entries(remoteVars)) {
      remoteEnvContent += `${key}=${value}\n`;
    }

    // 3. Check Local File
    if (await fs.pathExists(envPath)) {
      if (options.force) {
        console.log("⚠️  Force pull enabled. Overwriting local changes...");
      } else {
        // Read and parse local file
        const localContent = await fs.readFile(envPath, "utf-8");
        const localVars = dotenv.parse(localContent);

        // Compare Content
        if (areEnvVarsEqual(localVars, remoteVars as Record<string, string>)) {
          console.log(
            "✅ Environment variables are already up to date (content match).",
          );
          return;
        }

        // Content differs, check timestamps
        const stats = await fs.stat(envPath);
        const localDate = stats.mtime;
        const serverDate = lastModified ? new Date(lastModified) : new Date(0); // Default to old if missing

        // Logic:
        // - If Local is Older: Safe to update (standard pull).
        // - If Local is Newer: Potential conflict/local changes. Warn & Prompt.

        if (localDate > serverDate) {
          console.log(
            "⚠️  Local .env file is newer than the server version and has different content.",
          );
          console.log("   Your local changes will be lost if you overwrite.");

          const { confirm } = await inquirer.prompt([
            {
              type: "confirm",
              name: "confirm",
              message:
                "Do you want to overwrite your local .env file with the server version?",
              default: false,
            },
          ]);

          if (!confirm) {
            console.log("❌ Pull cancelled by user.");
            return;
          }
          console.log("🔄 Overwriting local changes...");
        } else {
          console.log(
            "🔄 Updates detected (server version is newer). Pulling changes...",
          );
        }
      }
    } else {
      console.log("🆕 Creating new .env file...");
    }

    // 4. Write File
    await fs.writeFile(envPath, remoteEnvContent);
    console.log(`✅ .env file updated successfully.`);
  } catch (error: any) {
    if (error.response) {
      console.error(
        `❌ Server error: ${error.response.status} - ${error.response.statusText}`,
      );
      if (error.response.data && error.response.data.error) {
        console.error(`   Message: ${error.response.data.error}`);
      }
    } else {
      console.error("❌ Error fetching variables:", error.message);
    }
    process.exit(1);
  }
};
