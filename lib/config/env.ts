const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  appEnv: getEnvVar("APP_ENV"),
  stripe: {
    secretKey: getEnvVar("STRIPE_SECRET_KEY"),
  },
  servicetitan: {
    clientId: getEnvVar("SERVICETITAN_CLIENT_ID"),
    clientSecret: getEnvVar("SERVICETITAN_CLIENT_SECRET"),
    appKey: getEnvVar("SERVICETITAN_APP_KEY"),
    tenantId: parseInt(getEnvVar("SERVICETITAN_TENANT_ID")),
    baseUrl: getEnvVar("SERVICETITAN_BASE_URL"),
  },
  whereby: {
    apiToken: getEnvVar("WHEREBY_API_TOKEN"),
  },
} as const;
