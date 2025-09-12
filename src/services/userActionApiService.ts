/**
 * User Action API Service for the Quiz Application
 * Provides methods to interact with user action-related endpoints
 */

import { BaseApiService } from './baseApiService';
import { UserAction, UserStats, ApiResponse, Subject, UserSubjectSelection } from './apiTypes';

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

  /**
   * Record user selected subject
   */
  async selectSubject(
    subjectId: string,
    userId?: string
  ): Promise<ApiResponse<UserSubjectSelection>> {
    const requestBody: { subjectId: string; userId?: string } = {
      subjectId,
    };

    if (userId) {
      requestBody.userId = userId;
    }

    return this.fetchApi<UserSubjectSelection>('/user-actions/select-subject', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get user's current selected subject
   */
  async getCurrentSubject(userId?: string): Promise<ApiResponse<Subject | null>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);

    const queryString = params.toString();
    const endpoint = `/user-actions/current-subject${queryString ? `?${queryString}` : ''}`;

    return this.fetchApi<Subject | null>(endpoint);
  }
}