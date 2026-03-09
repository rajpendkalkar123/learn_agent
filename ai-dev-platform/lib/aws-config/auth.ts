/**
 * Cognito Authentication Service
 * Replaces NextAuth with AWS Cognito
 */

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  RespondToAuthChallengeCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { awsConfig, cognitoClient, apiClient } from './api-client';

export interface CognitoUser {
  sub: string;
  email: string;
  name: string;
  email_verified: boolean;
  knowledge_level?: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  knowledgeLevel: string = 'intermediate'
): Promise<{ userSub: string }> {
  try {
    const command = new SignUpCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'custom:knowledge_level', Value: knowledgeLevel },
      ],
    });

    const response = await cognitoClient.send(command);
    return { userSub: response.UserSub! };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Confirm email verification code
 */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<void> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Confirm sign up error:', error);
    throw new Error(error.message || 'Failed to confirm sign up');
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthTokens> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: awsConfig.userPoolClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed');
    }

    const tokens = {
      accessToken: response.AuthenticationResult.AccessToken!,
      idToken: response.AuthenticationResult.IdToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
    };

    // Store tokens
    storeTokens(tokens);
    apiClient.setToken(tokens.accessToken);

    return tokens;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: awsConfig.userPoolClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Failed to refresh session');
    }

    const tokens = {
      accessToken: response.AuthenticationResult.AccessToken!,
      idToken: response.AuthenticationResult.IdToken!,
      refreshToken, // Refresh token doesn't change
    };

    storeTokens(tokens);
    apiClient.setToken(tokens.accessToken);

    return tokens;
  } catch (error: any) {
    console.error('Refresh session error:', error);
    throw error;
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser(accessToken: string): Promise<CognitoUser> {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const attributes: Record<string, string> = {};
    response.UserAttributes?.forEach(attr => {
      if (attr.Name && attr.Value) {
        attributes[attr.Name] = attr.Value;
      }
    });

    return {
      sub: attributes['sub'],
      email: attributes['email'],
      name: attributes['name'],
      email_verified: attributes['email_verified'] === 'true',
      knowledge_level: attributes['custom:knowledge_level'] || 'intermediate',
    };
  } catch (error: any) {
    console.error('Get user error:', error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOut(accessToken: string): Promise<void> {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await cognitoClient.send(command);
    clearTokens();
  } catch (error: any) {
    console.error('Sign out error:', error);
    clearTokens(); // Clear tokens anyway
  }
}

/**
 * Initiate password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw new Error(error.message || 'Failed to initiate password reset');
  }
}

/**
 * Confirm password reset with code
 */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: awsConfig.userPoolClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error('Confirm forgot password error:', error);
    throw new Error(error.message || 'Failed to reset password');
  }
}

/**
 * Store tokens in session storage
 */
function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.setItem('accessToken', tokens.accessToken);
  sessionStorage.setItem('idToken', tokens.idToken);
  sessionStorage.setItem('refreshToken', tokens.refreshToken);
}

/**
 * Get stored tokens
 */
export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  const accessToken = sessionStorage.getItem('accessToken');
  const idToken = sessionStorage.getItem('idToken');
  const refreshToken = sessionStorage.getItem('refreshToken');

  if (!accessToken || !idToken || !refreshToken) {
    return null;
  }

  return { accessToken, idToken, refreshToken };
}

/**
 * Clear stored tokens
 */
function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('idToken');
  sessionStorage.removeItem('refreshToken');
  apiClient.setToken('');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const tokens = getStoredTokens();
  if (!tokens) return false;

  try {
    // Try to get current user
    await getCurrentUser(tokens.accessToken);
    apiClient.setToken(tokens.accessToken);
    return true;
  } catch (error) {
    // Token might be expired, try to refresh
    try {
      await refreshSession(tokens.refreshToken);
      return true;
    } catch (refreshError) {
      clearTokens();
      return false;
    }
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<{ user: CognitoUser; tokens: AuthTokens } | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  try {
    const user = await getCurrentUser(tokens.accessToken);
    return { user, tokens };
  } catch (error) {
    try {
      const newTokens = await refreshSession(tokens.refreshToken);
      const user = await getCurrentUser(newTokens.accessToken);
      return { user, tokens: newTokens };
    } catch (refreshError) {
      clearTokens();
      return null;
    }
  }
}
