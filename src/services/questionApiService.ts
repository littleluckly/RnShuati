/**
 * Question API Service for the Quiz Application
 * Provides methods to interact with question-related endpoints
 */

import { BaseApiService } from './baseApiService';
import {
  Question,
  RandomQuestionListConfig,
  FilteredQuestionListConfig,
  FilteredQuestionListResponse,
  ApiResponse
} from './apiTypes';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 音频文件缓存键前缀
const AUDIO_CACHE_KEY_PREFIX = 'audio_cache_';
// 音频文件缓存时间（一年）
const AUDIO_CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;

/**
 * Question API Service Class
 */
export class QuestionApiService extends BaseApiService {
  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Get a random question
   */
  async getRandomQuestion(
    subjectId?: string,
    difficulty?: string
  ): Promise<ApiResponse<Question>> {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (difficulty) params.append('difficulty', difficulty);

    const queryString = params.toString();
    const endpoint = `/questions/random${queryString ? `?${queryString}` : ''}`;
    return this.fetchApi<Question>(endpoint);
  }

  /**
   * Get a list of random questions
   */
  async getRandomQuestionList(
    config: RandomQuestionListConfig
  ): Promise<ApiResponse<{ questions: Question[]; total: number; config: any }>> {
    return this.fetchApi<{ questions: Question[]; total: number; config: any }>(
      '/questions/random-list',
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  /**
   * Get filtered question list
   */
  async getFilteredQuestionList(
    config: FilteredQuestionListConfig
  ): Promise<ApiResponse<FilteredQuestionListResponse>> {
    const requestBody = {
      page: 1,
      limit: 10,
      ...config,
    };

    return this.fetchApi<FilteredQuestionListResponse>('/questions/list', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * 从服务器下载音频文件并保存到本地存储
   * @param fileName 要下载的音频文件名
   * @param onProgress 报告下载进度的回调函数
   * @returns 包含本地文件路径或错误信息的Promise
   */
  async downloadAudioFile(
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<string>> {
    try {
      // 检查缓存中是否已有该文件且未过期
      const cacheKey = `${AUDIO_CACHE_KEY_PREFIX}${fileName}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        const { filePath, timestamp } = JSON.parse(cachedData);
        const now = Date.now();

        // 如果缓存未过期且文件存在，直接返回缓存路径
        if (now - timestamp < AUDIO_CACHE_DURATION) {
          const fileExists = await RNFS.exists(filePath);
          if (fileExists) {
            console.log(`使用缓存的音频文件: ${fileName}`);
            return {
              success: true,
              data: filePath,
              message: '从缓存获取音频文件'
            };
          }
        }
      }

      // 构建下载URL
      const downloadUrl = `${this.baseUrl}/questions/audio/download/${fileName}`;
      console.log('下载URL:', downloadUrl);
      // 创建本地文件路径
      const localFilePath = `${RNFS.DocumentDirectoryPath}/audio_${fileName}`;
      console.log('本地文件路径:', localFilePath);

      // 自定义请求头，模仿Postman的请求头
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Content-Type': 'audio/mpeg'
      };

      let retryCount = 0;
      const maxRetries = 2;
      let downloadResult;

      // 添加重试机制
      while (retryCount <= maxRetries) {
        try {
          // 下载文件
          const download = RNFS.downloadFile({
            fromUrl: downloadUrl,
            toFile: localFilePath,
            headers: headers,
            background: true,
            discretionary: true,
            progressDivider: 1,
            progress: (res) => {
              if (onProgress) {
                const progress = Math.round((res.bytesWritten / res.contentLength) * 100);
                onProgress(progress);
              }
            },
          });

          downloadResult = await download.promise;
          console.log(`下载尝试 ${retryCount + 1} 结果:`, downloadResult);

          // 如果成功或遇到非5xx错误，退出循环
          if (downloadResult.statusCode === 200 || downloadResult.statusCode < 500) {
            break;
          }
        } catch (retryError) {
          console.warn(`重试尝试 ${retryCount + 1} 失败:`, retryError);
        }

        retryCount++;
        // 如果还有重试次数，等待一段时间后重试
        if (retryCount <= maxRetries) {
          console.log(`正在重试下载 (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (downloadResult?.statusCode === 200) {
        // 保存到缓存
        const cacheData = {
          filePath: localFilePath,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

        console.log(`音频文件下载成功: ${fileName}`);
        return {
          success: true,
          data: localFilePath,
          message: '音频文件下载成功'
        };
      } else {
        console.error(`下载失败，状态码: ${downloadResult?.statusCode}`);
        throw new Error(`音频文件下载失败: ${downloadResult?.statusCode}`);
      }
    } catch (error) {
      console.error(`音频文件下载失败: ${error}`);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '下载音频文件时发生未知错误'
      };
    }
  }
}