/**
 * 刷题应用基础API服务
 * 提供带错误处理的通用fetch方法
 */

import { Alert } from 'react-native';
import { API_BASE_URL, ApiResponse } from './apiTypes';

/**
 * API服务基类
 */
export class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 带错误处理的通用fetch方法
   */
  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result: ApiResponse<T> = await response.json();
      if (!result.success) {
        Alert.alert(
          result.message,
        );
      }
      return result;
    } catch (error) {
      console.error(`API(${this.baseUrl}${endpoint}) 请求失败:${error}`);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '发生未知错误',
      };
    }
  }
}