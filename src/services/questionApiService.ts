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
    console.log(requestBody, 'requestBody')

    return this.fetchApi<FilteredQuestionListResponse>('/questions/list', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }
}