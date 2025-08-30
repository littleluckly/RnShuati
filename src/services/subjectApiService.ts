/**
 * Subject API Service for the Quiz Application
 * Provides methods to interact with subject-related endpoints
 */

import { BaseApiService } from './baseApiService';
import { Subject, SubjectTagStat, ApiResponse } from './apiTypes';

/**
 * Subject API Service Class
 */
export class SubjectApiService extends BaseApiService {
  // ==================== SUBJECT MANAGEMENT ====================

  /**
   * Get all enabled subjects
   */
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    console.log('endpoint-getSubjects')
    return this.fetchApi<Subject[]>('/subjects');
  }

  /**
   * Get all subjects with detailed information
   */
  async getAllSubjects(): Promise<ApiResponse<Subject[]>> {
    return this.fetchApi<Subject[]>('/subjects/all');
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(id: string): Promise<ApiResponse<Subject>> {
    return this.fetchApi<Subject>(`/subjects/${id}`);
  }

  /**
   * Get all tags for a subject
   */
  async getSubjectTags(id: string): Promise<ApiResponse<SubjectTagStat[]>> {
    return this.fetchApi<SubjectTagStat[]>(`/subjects/${id}/tags`);
  }

  /**
   * Add user-defined tag to subject
   */
  async addUserTag(
    subjectId: string,
    tagName: string,
    tagType: string = 'custom'
  ): Promise<ApiResponse<null>> {
    return this.fetchApi<null>(`/subjects/${subjectId}/user-tags`, {
      method: 'POST',
      body: JSON.stringify({ name: tagName, type: tagType }),
    });
  }

  /**
   * Update user-defined tag
   */
  async updateUserTag(
    subjectId: string,
    oldTagName: string,
    newTagName: string,
    tagType?: string
  ): Promise<ApiResponse<null>> {
    return this.fetchApi<null>(`/subjects/${subjectId}/user-tags/${oldTagName}`, {
      method: 'PUT',
      body: JSON.stringify({ newName: newTagName, type: tagType }),
    });
  }

  /**
   * Delete user-defined tag
   */
  async deleteUserTag(
    subjectId: string,
    tagName: string
  ): Promise<ApiResponse<null>> {
    return this.fetchApi<null>(`/subjects/${subjectId}/user-tags/${tagName}`, {
      method: 'DELETE',
    });
  }
}