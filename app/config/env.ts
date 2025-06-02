const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  environment: "integration",
  stripe: {
    secretKey: getEnvVar("STRIPE_SECRET_KEY"),
    priceId: getEnvVar("STRIPE_PRICE_ID"),
  },
  servicetitan: {
    clientId: getEnvVar("SERVICETITAN_CLIENT_ID"),
    clientSecret: getEnvVar("SERVICETITAN_CLIENT_SECRET"),
    appKey: getEnvVar("SERVICETITAN_APP_KEY"),
    tenantId: getEnvVar("SERVICETITAN_TENANT_ID"),
    technicianId: getEnvVar("SERVICETITAN_TECHNICIAN_ID"),
  },
} as const; 
