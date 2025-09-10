/**
 * API Types for the Quiz Application
 * Contains all interface definitions for API responses and requests
 */

// Base API configuration
export const API_BASE_URL = 'http://localhost:3000';

// Generic API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

// Subject related interfaces
export interface SubjectTag {
  name: string;
  value: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  tags: SubjectTag[];
  userTags: SubjectTag[];
  difficultyLevels: string[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  questionStats?: {
    total: number;
    byDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export interface SubjectTag {
  name: string;
  type: string;
}

export interface DifficultyOption {
  name: string;
  value: string;
}

// Question related interfaces
export interface QuestionFiles {
  audio_answer_simple?: string;
  audio_answer_detail?: string;
  audio_question?: string;
}

export interface Question {
  _id: string;
  id: string;
  type: string;
  difficulty: string;
  tags: string[];
  question_length: number;
  simple_answer_length: number;
  detailed_analysis_length: number;
  created_at: string | null;
  question_markdown: string;
  answer_simple_markdown: string;
  answer_detail_markdown: string;
  answer_analysis_markdown: string;
  files: QuestionFiles;
  subjectId: string;
  audioKey?: string;
}

export interface RandomQuestionListConfig {
  subjectId: string;
  total?: number;
  difficultyConfig?: {
    easy: number;
    medium: number;
    hard: number;
  };
  tagConfig?: Record<string, number>;
}

export interface FilteredQuestionListConfig {
  subjectId?: string;
  difficulty?: string | string[];
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export interface FilteredQuestionListResponse {
  questions: Question[];
  pagination: Pagination;
  filters: {
    subjectId?: string;
    difficulty?: string | string[];
    tags?: string[];
  };
}

// User action interfaces
export interface UserAction {
  userId?: string;
  questionId: string;
  action: 'favorited' | 'deleted' | 'practiced';
}

export interface UserStats {
  favorited: number;
  deleted: number;
  total: number;
}