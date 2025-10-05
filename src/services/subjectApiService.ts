/**
 * Subject API Service for the Quiz Application
 * Provides methods to interact with subject-related endpoints
 */

import { BaseApiService } from './baseApiService';
import { Subject, SubjectTag, ApiResponse, SubjectListResponse, SubjectWithStatsListResponse, TagCount } from './apiTypes';

// Request interfaces
export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  tags?: Array<{ name: string; type: string }>;
  userTags?: Array<{ name: string; type: string }>;
  difficultyLevels?: string[];
  isEnabled?: boolean;
}

export interface UpdateSubjectRequest {
  name?: string;
  code?: string;
  description?: string;
  tags?: Array<{ name: string; type: string }>;
  userTags?: Array<{ name: string; type: string }>;
  difficultyLevels?: string[];
  isEnabled?: boolean;
}

export interface GetSubjectsParams {
  page?: number;
  limit?: number;
  searchKeyword?: string;
}

/**
 * Subject API Service Class
 */
export class SubjectApiService extends BaseApiService {
  // ==================== SUBJECT MANAGEMENT ====================

  /**
   * Get all enabled subjects
   */
  async getSubjects(params?: GetSubjectsParams): Promise<ApiResponse<SubjectListResponse>> {
    let url = '/subjects';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.searchKeyword) searchParams.append('searchKeyword', params.searchKeyword);
      url = `${url}?${searchParams.toString()}`;
    }
    return this.fetchApi<SubjectListResponse>(url, { method: 'GET' });
  }

  /**
   * Get all subjects with detailed information including question statistics
   */
  async getAllSubjects(params?: GetSubjectsParams): Promise<ApiResponse<SubjectWithStatsListResponse>> {
    let url = '/subjects/all';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.searchKeyword) searchParams.append('searchKeyword', params.searchKeyword);
      url = `${url}?${searchParams.toString()}`;
    }
    return this.fetchApi<SubjectWithStatsListResponse>(url, { method: 'GET' });
  }

  /**
   * Create a new subject
   */
  async createSubject(data: CreateSubjectRequest): Promise<ApiResponse<Subject>> {
    return this.fetchApi<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Update an existing subject
   */
  async updateSubject(id: string, data: UpdateSubjectRequest): Promise<ApiResponse<Subject>> {
    return this.fetchApi<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Delete a subject (soft delete)
   */
  async deleteSubject(id: string): Promise<ApiResponse<null>> {
    return this.fetchApi<null>(`/subjects/${id}`, {
      method: 'DELETE'
    });
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
  async getSubjectTags(id: string): Promise<ApiResponse<Array<{ name: string; value: string }>>> {
    return this.fetchApi<Array<{ name: string; value: string }>>(`/subjects/${id}/all-tags`);
  }

  /**
   * Get tag counts for a subject
   */
  async getTagsCount(id: string): Promise<ApiResponse<TagCount[]>> {
    return this.fetchApi<TagCount[]>(`/subjects/${id}/tags-count`);
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
      body: JSON.stringify({ name: tagName, value: tagType }),
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
      body: JSON.stringify({ newName: newTagName, value: tagType }),
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