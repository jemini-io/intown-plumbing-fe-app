import { ServiceTitanBaseClient, ServiceTitanAuth } from './base-client';

// Import generated services
import * as DispatchServices from '../generated/dispatch';
import * as JpmServices from '../generated/jpm';
import * as PricebookServices from '../generated/pricebook';
import * as SettingsServices from '../generated/settings';
import * as CrmServices from '../generated/crm';
import { OpenAPIConfig } from '../generated/dispatch/core/OpenAPI';

export class ServiceTitanClient {
  private baseClient: ServiceTitanBaseClient;
  
  // API services
  public dispatch: typeof DispatchServices;
  public jpm: typeof JpmServices;
  public pricebook: typeof PricebookServices;
  public settings: typeof SettingsServices;
  public crm: typeof CrmServices;

  constructor(auth: ServiceTitanAuth) {
    this.baseClient = new ServiceTitanBaseClient(auth);
    
    // Configure OpenAPI for each service with auth headers
    this.configureServiceAuth(DispatchServices.OpenAPI, auth);
    this.configureServiceAuth(JpmServices.OpenAPI, auth);
    this.configureServiceAuth(PricebookServices.OpenAPI, auth);
    this.configureServiceAuth(SettingsServices.OpenAPI, auth);
    this.configureServiceAuth(CrmServices.OpenAPI, auth);
    
    // Initialize API services
    this.dispatch = DispatchServices;
    this.jpm = JpmServices;
    this.pricebook = PricebookServices;
    this.settings = SettingsServices;
    this.crm = CrmServices;
  }

  private configureServiceAuth(openAPI: OpenAPIConfig, auth: ServiceTitanAuth) {
    // Set the auth token
    openAPI.TOKEN = auth.authToken;
    
    // Set the ST-App-Key header
    openAPI.HEADERS = {
      'ST-App-Key': auth.appKey,
      'Content-Type': 'application/json'
    };
  }

  getAuth(): ServiceTitanAuth {
    return this.baseClient.getAuth();
  }

  getBaseClient(): ServiceTitanBaseClient {
    return this.baseClient;
  }
}

// Export types
export * from './base-client';

// Export specific types to avoid conflicts
export type { ServiceTitanAuth } from './base-client'; 