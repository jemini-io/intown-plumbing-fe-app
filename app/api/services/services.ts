import axios from 'axios';

class AuthService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://auth.servicetitan.io' : 'https://auth-integration.servicetitan.io';
    }

    async getAuthToken(clientId: string, clientSecret: string): Promise<string> {
        const url = `${this.baseUrl}/connect/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        });

        try {
            const response = await axios.post(url, data, { headers });
            return response.data.access_token;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`[AuthService.getAuthToken] HTTP ${error.response.status}: ${error.response.statusText}`);
                    console.error('Response data:', error.response.data);
                    throw new Error(`Failed to get auth token: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
                } else if (error.request) {
                    console.error(`[AuthService.getAuthToken] No response received:`, error.request);
                    throw new Error('No response received from server while getting auth token.');
                } else {
                    console.error(`[AuthService.getAuthToken] Error:`, error.message);
                    throw new Error(`Error while getting auth token: ${error.message}`);
                }
            } else {
                console.error(`[AuthService.getAuthToken] Unexpected error:`, error);
                throw new Error(`Error while getting auth token: ${error as string}`);
            }
        }
    }
}


export { AuthService }; 
