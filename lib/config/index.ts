import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { ConfigSchema, type Config } from "./schema";
import { env } from "./env";

export function loadConfig(): Config {
  const appEnv = env.appEnv || "test";
  const configPath = join(__dirname, "..", "..", `lib/config/${appEnv}.yaml`);
  
  try {
    const fileContents = readFileSync(configPath, "utf8");
    const rawConfig = parse(fileContents);
    
    // Validate the configuration
    const validatedConfig = ConfigSchema.parse(rawConfig);
    
    return validatedConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config for environment '${env.appEnv}': ${error.message}`);
    }
    throw error;
  }
}

// Export a singleton instance
export const config = loadConfig();

// Export types for use in other files
export type { Config } from "./schema";