import * as DispatchServices from '../generated/dispatch';
import * as JpmServices from '../generated/jpm';
import * as PricebookServices from '../generated/pricebook';
import * as SettingsServices from '../generated/settings';
import * as CrmServices from '../generated/crm';
import * as AccountingServices from '../generated/accounting';
import { OpenAPIConfig } from '../generated/dispatch/core/OpenAPI';
import { ServiceTitanAuthManager } from './auth';
import { env } from '../../config/env';

export class ServiceTitanClient {
  public dispatch: typeof DispatchServices;
  public jpm: typeof JpmServices;
  public pricebook: typeof PricebookServices;
  public settings: typeof SettingsServices;
  public crm: typeof CrmServices;
  public accounting: typeof AccountingServices;
  private authManager: ServiceTitanAuthManager;
  private appKey: string;

  constructor() {
    this.authManager = new ServiceTitanAuthManager();
    this.appKey = env.servicetitan.appKey;

    // Configure OpenAPI for each service with dynamic token resolver
    this.configureServiceAuth(DispatchServices.OpenAPI);
    this.configureServiceAuth(JpmServices.OpenAPI);
    this.configureServiceAuth(PricebookServices.OpenAPI);
    this.configureServiceAuth(SettingsServices.OpenAPI);
    this.configureServiceAuth(CrmServices.OpenAPI);
    this.configureServiceAuth(AccountingServices.OpenAPI);
    this.dispatch = DispatchServices;
    this.jpm = JpmServices;
    this.pricebook = PricebookServices;
    this.settings = SettingsServices;
    this.crm = CrmServices;
    this.accounting = AccountingServices;
  }

  private configureServiceAuth(openAPI: OpenAPIConfig) {
    openAPI.TOKEN = async () => await this.authManager.getToken();
    openAPI.HEADERS = {
      'ST-App-Key': this.appKey,
      'Content-Type': 'application/json'
    };
  }

  getAuthManager(): ServiceTitanAuthManager {
    return this.authManager;
  }
}
