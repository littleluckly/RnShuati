export type Card = {
  id: string;
  question: string;
  shortAnswer?: string;
  fullAnswer?: string;
  instanceId?: string; // ✅ 新增：用于强制 re-mount
};

export type SwipeableCardProps = {
  card: Card;
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