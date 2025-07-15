import axios, { AxiosInstance } from 'axios';

export interface ServiceTitanAuth {
  authToken: string;
  appKey: string;
  tenantId: number;
}

export class ServiceTitanBaseClient {
  private axiosInstance: AxiosInstance;
  private auth: ServiceTitanAuth;

  constructor(auth: ServiceTitanAuth, baseURL?: string) {
    this.auth = auth;
    this.axiosInstance = axios.create({
      baseURL: baseURL || 'https://api-integration.servicetitan.io',
      headers: {
        'ST-App-Key': auth.appKey,
        'Authorization': `Bearer ${auth.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to inject tenant ID
    this.axiosInstance.interceptors.request.use((config) => {
      if (config.url && config.url.includes('{tenant}')) {
        config.url = config.url.replace('{tenant}', this.auth.tenantId.toString());
      }
      return config;
    });
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  getAuth(): ServiceTitanAuth {
    return this.auth;
  }
} 