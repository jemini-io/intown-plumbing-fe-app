export interface ServiceTitanApiConfig {
  name: string;
  specPath: string;
  outputPath: string;
  baseUrl: string;
}

export const SERVICE_TITAN_APIS: ServiceTitanApiConfig[] = [
  {
    name: 'dispatch',
    specPath: 'res/service-titan/tenant-dispatch-v2.yaml',
    outputPath: 'lib/servicetitan/generated/dispatch',
    baseUrl: 'https://api.servicetitan.io/dispatch/v2'
  },
  {
    name: 'jpm',
    specPath: 'res/service-titan/tenant-jpm-v2.yaml', 
    outputPath: 'lib/servicetitan/generated/jpm',
    baseUrl: 'https://api.servicetitan.io/jpm/v2'
  },
  {
    name: 'pricebook',
    specPath: 'res/service-titan/tenant-pricebook-v2.yaml',
    outputPath: 'lib/servicetitan/generated/pricebook', 
    baseUrl: 'https://api.servicetitan.io/pricebook/v2'
  },
  {
    name: 'accounting',
    specPath: 'res/service-titan/tenant-accounting-v2.yaml',
    outputPath: 'lib/servicetitan/generated/accounting',
    baseUrl: 'https://api.servicetitan.io/accounting/v2'
  },
  {
    name: 'settings',
    specPath: 'res/service-titan/tenant-settings-v2.yaml',
    outputPath: 'lib/servicetitan/generated/settings',
    baseUrl: 'https://api.servicetitan.io/settings/v2'
  },
  {
    name: 'crm',
    specPath: 'res/service-titan/tenant-crm-v2.yaml',
    outputPath: 'lib/servicetitan/generated/crm',
    baseUrl: 'https://api.servicetitan.io/crm/v2'
  }
];

export const GENERATION_CONFIG = {
  useUnionTypes: true,
  useOptions: true,
  exportSchemas: true,
  exportServices: true,
  exportCore: true,
  exportModels: true
}; 