/**
 * AWS API Gateway Client Configuration
 * All frontend API calls route through API Gateway
 */

import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

// Environment variables
export const awsConfig = {
  apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '',
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
};

// Cognito client for authentication
export const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
});

/**
 * API Client for making authenticated requests to API Gateway
 */
class APIClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get authentication token from session storage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from memory first
    if (this.accessToken) return this.accessToken;
    
    // Try to get from session storage
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      this.accessToken = token;
      return token;
    }
    
    return null;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const url = `${this.baseUrl}${path}`;
    console.log(`API Request: ${method} ${url}`);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body: any): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body: any): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

// Export singleton instance
export const apiClient = new APIClient(awsConfig.apiGatewayUrl);

/**
 * Validate AWS configuration
 */
export function validateAWSConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!awsConfig.apiGatewayUrl) {
    errors.push('NEXT_PUBLIC_API_GATEWAY_URL is not configured');
  }

  if (!awsConfig.userPoolId) {
    errors.push('NEXT_PUBLIC_USER_POOL_ID is not configured');
  }

  if (!awsConfig.userPoolClientId) {
    errors.push('NEXT_PUBLIC_USER_POOL_CLIENT_ID is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if running in production mode (with AWS backend)
 */
export const isProductionMode = (): boolean => {
  return Boolean(awsConfig.apiGatewayUrl && awsConfig.userPoolId);
};
