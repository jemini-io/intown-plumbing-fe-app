const getEnvVar = (key: string, required: boolean = true, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const env = {
  nextEnv: getEnvVar("NEXT_PUBLIC_APP_ENV", false, "prod"),
  appEnv: getEnvVar("APP_ENV", false, "prod"),
  stripe: {
    secretKey: getEnvVar("STRIPE_SECRET_KEY", true),
  },
  servicetitan: {
    clientId: getEnvVar("SERVICETITAN_CLIENT_ID", true),
    clientSecret: getEnvVar("SERVICETITAN_CLIENT_SECRET", true),
    appKey: getEnvVar("SERVICETITAN_APP_KEY", true),
    tenantId: parseInt(getEnvVar("SERVICETITAN_TENANT_ID", true)),
    baseUrl: getEnvVar("SERVICETITAN_BASE_URL", false, "https://api.servicetitan.io"),
  },
  podium: {
    enabled: getEnvVar("PODIUM_ENABLED", false, "false") === "true",
    useTestTechnicianNumber: getEnvVar("PODIUM_USE_TEST_TECHNICIAN_NUMBER", false, "false"),
  },
  whereby: {
    apiToken: getEnvVar("WHEREBY_API_TOKEN", true),
  },
} as const;
