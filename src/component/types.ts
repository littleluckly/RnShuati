export type Card = {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  instanceId?: string; // ✅ 新增：用于强制 re-mount
};

// QuestionMeta related types
export type QuestionFiles = {
  audio_simple?: string;
  audio_question?: string;
  audio_analysis?: string;
  meta: string;
};

export type QuestionMetaData = {
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
};

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'choice' | 'essay' | 'coding';

export type SwipeableCardProps = {
  questionMeta: QuestionMetaData; // 使用 QuestionMeta 而不是 Card
  onDismiss: () => void;
  onCardDelete: () => void;
  onSwipeBack?: () => void;
  index: number;
  totalCards: number;
  isActive: boolean;
  onCardTouch: (index: number) => void;
  canSwipeBack: boolean;
};

export type ProgressCounterProps = {
  current: number;
  total: number;
  answered: number;
};

export type QuestionCardProps = {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  initialFavorite?: boolean;
  onDislike?: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  style?: Record<string, any>;
}