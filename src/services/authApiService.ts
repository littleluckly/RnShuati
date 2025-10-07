/**
 * 刷题应用认证API服务
 * 提供用户认证、注册和密码管理相关方法
 */

import { BaseApiService } from './baseApiService';
import { ApiResponse, LoginRequest, LoginResponse, LogoutRequest, RegisterRequest, RegisterResponse, UserInfoResponse, ForgotPasswordRequest, ResetPasswordRequest } from './apiTypes';

/**
 * 认证API服务类
 * 处理用户认证、注册和密码管理功能
 */
export class AuthApiService extends BaseApiService {
  /**
   * 用户登录
   * 使用用户名/邮箱和密码认证用户
   * @param identifier 用户的用户名或邮箱
   * @param password 用户的密码
   * @param isEmail 标识符是否为邮箱（默认为false）
   * @returns 包含登录响应数据或错误消息的Promise
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
   * 用户登出
   * 清除用户认证信息
   * @param userId 用户的唯一标识符
   * @param token 用户的认证令牌
   * @returns 包含登出结果的Promise
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
   * 获取用户信息
   * 检索当前用户信息并验证登录状态
   * @param token 用户的认证令牌
   * @returns 包含用户信息或错误消息的Promise
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
   * 用户注册
   * 创建新用户账户
   * @param username 新用户的用户名
   * @param password 新用户的密码
   * @param email 可选的邮箱地址
   * @returns 包含注册结果的Promise
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
   * 忘记密码
   * 向用户邮箱发送密码重置链接
   * @param email 用户注册的邮箱地址
   * @returns 包含操作结果的Promise
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const requestBody: ForgotPasswordRequest = { email };

    return this.fetchApi<null>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * 重置密码
   * 使用验证码为用户设置新密码
   * @param email 用户注册的邮箱地址
   * @param verificationCode 邮箱中的验证码
   * @param newPassword 新密码
   * @returns 包含操作结果的Promise
   */
  async resetPassword(
    email: string,
    verificationCode: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const requestBody: ResetPasswordRequest = {
      email,
      verificationCode,
      newPassword,
    };
    return this.fetchApi<null>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * 获取当前已认证用户信息
   * @param token 用户的认证令牌
   * @returns 包含用户信息或错误消息的Promise
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

export default new AuthApiService();