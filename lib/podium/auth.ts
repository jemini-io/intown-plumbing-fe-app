import { PODIUM_CONFIG } from "@/lib/config/podium";
import { PodiumToken } from "./types";

class PodiumAuth {
  private token: PodiumToken | null = null;
  private expiresAt: number = 0;

  async getAccessToken({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<string> {
    if (this.token && Date.now() < this.expiresAt && !forceRefresh) {
      return this.token.access_token;
    }
    await this.refreshToken();
    if (!this.token) throw new Error("Failed to obtain Podium access token");
    return this.token.access_token;
  }

  private async refreshToken(): Promise<void> {
    // Use refresh token flow
    const body = {
      client_id: PODIUM_CONFIG.clientId,
      client_secret: PODIUM_CONFIG.clientSecret,
      grant_type: "refresh_token",
      refresh_token: PODIUM_CONFIG.refreshToken,
    };

    const response = await fetch(PODIUM_CONFIG.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get Podium token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const tokenData = await response.json();
    this.token = tokenData;
    this.expiresAt = Date.now() + (this.token!.expires_in - 300) * 1000;
  }

  // Method to check if token is valid (useful for testing)
  isTokenValid(): boolean {
    return this.token !== null && Date.now() < this.expiresAt;
  }

  // Method to clear token (useful for testing or error recovery)
  clearToken(): void {
    this.token = null;
    this.expiresAt = 0;
  }
}

// Singleton instance
export const podiumAuth = new PodiumAuth();
