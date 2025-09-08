import type { Question } from '@/services/apiTypes';

export type Card = {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  instanceId?: string; // ✅ 新增：用于强制 re-mount
};

// Question related types
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'choice' | 'essay' | 'coding';

export type SwipeableCardProps = {
  question: Question; // 使用 Question 类型
  onDismiss: () => void;
  onCardDelete: () => void;
  onSwipeBack?: () => void;
  index: number;
  totalCards: number;
  isActive: boolean;
  onCardTouch: (index: number) => void;
  canSwipeBack: boolean;
  // 新增：源布局信息，用于共享元素过渡动画
  sourceLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type QuestionCardProps = {
  id: string;
  question: string;
  simpleAnswer?: string;
  analysisAnswer?: string;
  initialFavorite?: boolean;
  onDislike?: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onDelete?: (id: string) => void;
  style?: Record<string, any>;
}