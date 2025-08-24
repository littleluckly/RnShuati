/**
 * Question Meta Data Class
 * Represents the structure of question metadata
 */
export class QuestionMeta {
  public id: string;
  public type: string;
  public difficulty: string;
  public tags: string[];
  public question_length: number;
  public simple_answer_length: number;
  public detailed_analysis_length: number;
  public created_at: string | null;
  public question_markdown: string;
  public answer_simple_markdown: string;
  public answer_analysis_markdown: string;
  public files: QuestionFiles;

  constructor(data: QuestionMetaData) {
    this.id = data.id;
    this.type = data.type;
    this.difficulty = data.difficulty;
    this.tags = data.tags;
    this.question_length = data.question_length;
    this.simple_answer_length = data.simple_answer_length;
    this.detailed_analysis_length = data.detailed_analysis_length;
    this.created_at = data.created_at;
    this.question_markdown = data.question_markdown;
    this.answer_simple_markdown = data.answer_simple_markdown;
    this.answer_analysis_markdown = data.answer_analysis_markdown;
    this.files = data.files;
  }

  /**
   * Get formatted difficulty level
   */
  public getFormattedDifficulty(): string {
    const difficultyMap: Record<string, string> = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };
    return difficultyMap[this.difficulty] || this.difficulty;
  }

  /**
   * Get formatted question type
   */
  public getFormattedType(): string {
    const typeMap: Record<string, string> = {
      'choice': '选择题',
      'essay': '问答题',
      'coding': '编程题'
    };
    return typeMap[this.type] || this.type;
  }

  /**
   * Check if question has audio files
   */
  public hasAudioFiles(): boolean {
    return !!(this.files.audio_simple || this.files.audio_question || this.files.audio_analysis);
  }

  /**
   * Get all available audio files
   */
  public getAudioFiles(): Partial<Pick<QuestionFiles, 'audio_simple' | 'audio_question' | 'audio_analysis'>> {
    return {
      audio_simple: this.files.audio_simple,
      audio_question: this.files.audio_question,
      audio_analysis: this.files.audio_analysis
    };
  }

  /**
   * Check if question has specific tag
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get formatted tags as comma-separated string
   */
  public getTagsString(): string {
    return this.tags.join(', ');
  }

  /**
   * Calculate total content length
   */
  public getTotalContentLength(): number {
    return this.question_length + this.simple_answer_length + this.detailed_analysis_length;
  }

  /**
   * Create instance from JSON data
   */
  public static fromJSON(json: string): QuestionMeta {
    const data: QuestionMetaData = JSON.parse(json);
    return new QuestionMeta(data);
  }

  /**
   * Create instance from object
   */
  public static fromObject(data: QuestionMetaData): QuestionMeta {
    return new QuestionMeta(data);
  }

  /**
   * Convert to JSON string
   */
  public toJSON(): string {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      difficulty: this.difficulty,
      tags: this.tags,
      question_length: this.question_length,
      simple_answer_length: this.simple_answer_length,
      detailed_analysis_length: this.detailed_analysis_length,
      created_at: this.created_at,
      question_markdown: this.question_markdown,
      answer_simple_markdown: this.answer_simple_markdown,
      answer_analysis_markdown: this.answer_analysis_markdown,
      files: this.files
    });
  }
}

/**
 * Question Files interface
 */
export interface QuestionFiles {
  audio_simple?: string;
  audio_question?: string;
  audio_analysis?: string;
  meta: string;
}

/**
 * Question Meta Data interface for constructor parameter
 */
export interface QuestionMetaData {
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
  answer_analysis_markdown: string;
  files: QuestionFiles;
}

/**
 * Type guards for validation
 */
export class QuestionMetaValidator {
  public static isValidDifficulty(difficulty: string): boolean {
    return ['easy', 'medium', 'hard'].includes(difficulty);
  }

  public static isValidType(type: string): boolean {
    return ['choice', 'essay', 'coding'].includes(type);
  }

  public static validateQuestionMeta(data: any): data is QuestionMetaData {
    return (
      typeof data.id === 'string' &&
      typeof data.type === 'string' &&
      typeof data.difficulty === 'string' &&
      Array.isArray(data.tags) &&
      typeof data.question_length === 'number' &&
      typeof data.simple_answer_length === 'number' &&
      typeof data.detailed_analysis_length === 'number' &&
      typeof data.question_markdown === 'string' &&
      typeof data.answer_simple_markdown === 'string' &&
      typeof data.answer_analysis_markdown === 'string' &&
      typeof data.files === 'object' &&
      typeof data.files.meta === 'string'
    );
  }
}