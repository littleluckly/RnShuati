/**
 * Base API Service for the Quiz Application
 * Provides generic fetch method with error handling
 */

import { Alert } from 'react-native';
import { API_BASE_URL, ApiResponse } from './apiTypes';

/**
 * API Service Base Class
 */
export class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch method with error handling
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
      console.error(`API(${this.baseUrl}${endpoint}) request failed:${error}`);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}