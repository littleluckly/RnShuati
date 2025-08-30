/**
 * User Action API Service for the Quiz Application
 * Provides methods to interact with user action-related endpoints
 */

import { BaseApiService } from './baseApiService';
import { UserAction, UserStats, ApiResponse } from './apiTypes';

/**
 * User Action API Service Class
 */
export class UserActionApiService extends BaseApiService {
  // ==================== USER ACTION MANAGEMENT ====================

  /**
   * Record user action
   */
  async recordUserAction(
    userId: string | undefined,
    questionId: string,
    action: 'favorited' | 'deleted' | 'practiced'
  ): Promise<ApiResponse<null>> {
    const requestBody: UserAction = {
      questionId,
      action,
    };

    if (userId) {
      requestBody.userId = userId;
    }

    return this.fetchApi<null>('/user-actions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId?: string): Promise<ApiResponse<UserStats>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const queryString = params.toString();
    const endpoint = `/user-actions/stats${queryString ? `?${queryString}` : ''}`;

    return this.fetchApi<UserStats>(endpoint);
  }
}