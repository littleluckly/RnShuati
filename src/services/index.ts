/**
 * API Service Entry Point
 * Exports all API service instances
 */

import { SubjectApiService } from './subjectApiService';
import { QuestionApiService } from './questionApiService';
import { UserActionApiService } from './userActionApiService';

// Export singleton instances
export const subjectApiService = new SubjectApiService();
export const questionApiService = new QuestionApiService();
export const userActionApiService = new UserActionApiService();