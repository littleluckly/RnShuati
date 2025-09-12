/*
 * Authentication API Service for the Quiz Application
 * Provides methods to handle user authentication, registration and password management
 */

import { BaseApiService } from './baseApiService';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RegisterRequest,
  RegisterResponse,
  UserInfoResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './apiTypes';

/**
 * Authentication API Service Class
 * Handles user authentication, registration and password management functionality
 */
export class AuthApiService extends BaseApiService {
  /**
   * User login
   * Authenticates a user with username/email and password
   * @param identifier User's username or email
   * @param password User's password
   * @param isEmail Whether the identifier is an email (default: false)
   * @returns Promise with login response data or error message
   */
  async login(
    identifier: string,
    password: string,
    isEmail: boolean = false
  ): Promise<ApiResponse<LoginResponse>> {
    const requestBody: LoginRequest = isEmail
      ? { email: identifier, password }
      : { username: identifier, password };

    return this.fetchApi<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * User logout
   * Clears user authentication information
   * @param userId User's unique identifier
   * @param token User's authentication token
   * @returns Promise with logout result
   */
  async logout(userId: string, token: string): Promise<ApiResponse<null>> {
    const requestBody: LogoutRequest = {
      userId,
      token,
    };

    return this.fetchApi<null>('/users/logout', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get user information
   * Retrieves current user information and verifies login status
   * @param token User's authentication token
   * @returns Promise with user information or error message
   */
  async getUserInfo(token: string): Promise<ApiResponse<UserInfoResponse>> {
    // 使用请求头方式传递token，这是推荐的安全做法
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    return this.fetchApi<UserInfoResponse>('/users/info', {
      method: 'GET',
      headers,
    });
  }

  /**
   * User registration
   * Creates a new user account
   * @param username New user's username
   * @param password New user's password
   * @param email Optional email address
   * @returns Promise with registration result
   */
  async register(
    username: string,
    password: string,
    email?: string
  ): Promise<ApiResponse<RegisterResponse>> {
    const requestBody: RegisterRequest = { username, password };
    if (email) {
      requestBody.email = email;
    }

    return this.fetchApi<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Forgot password
   * Sends password reset link to user's email
   * @param email User's registered email address
   * @returns Promise with operation result
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const requestBody: ForgotPasswordRequest = { email };

    return this.fetchApi<null>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Reset password
   * Sets a new password for the user using reset token
   * @param userId User's unique identifier
   * @param resetToken Password reset token
   * @param newPassword New password
   * @returns Promise with operation result
   */
  async resetPassword(
    userId: string,
    resetToken: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const requestBody: ResetPasswordRequest = {
      userId,
      resetToken,
      newPassword,
    };

    return this.fetchApi<null>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get current authenticated user information
   * @param token User's authentication token
   * @returns Promise with user information or error message
   */
  async getCurrentUser(token: string): Promise<ApiResponse<LoginResponse>> {
    return this.fetchApi<LoginResponse>('/user-actions/current-user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}