import { env } from '../../config/env';

export class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.environment === 'prod' ? 'https://auth.servicetitan.io' : 'https://auth-integration.servicetitan.io';
    }

    async getAuthToken(): Promise<{ access_token: string, expires_in: number }> {
        const url = `${this.baseUrl}/connect/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: env.servicetitan.clientId,
            client_secret: env.servicetitan.clientSecret
        });
        const response = await fetch(url, { method: 'POST', headers, body: data });
        if (!response.ok) throw new Error('Failed to fetch ServiceTitan token');
        return await response.json();
    }
}

export class ServiceTitanAuthManager {
    private token: string | null = null;
    private expiresAt: number = 0;
    private fetching: Promise<string> | null = null;
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async getToken(): Promise<string> {
        const now = Date.now();
        if (this.token && now < this.expiresAt - 60000) {
            return this.token;
        }
        if (this.fetching) {
            return this.fetching;
        }
        this.fetching = this.fetchNewToken();
        const token = await this.fetching;
        this.fetching = null;
        return token;
    }

    private async fetchNewToken(): Promise<string> {
        const json = await this.authService.getAuthToken();
        this.token = json.access_token;
        this.expiresAt = Date.now() + (json.expires_in * 1000);
        return this.token;
    }
}
