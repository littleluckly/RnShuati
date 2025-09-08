import { useState, useCallback, useMemo, useEffect, startTransition, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { Question } from '@/services/apiTypes';
import { userActionApiService } from '@/services';

interface UseQuizCardLogicProps {
  initialAnsweredCount?: number;
  questionState: any;
  loadMore: () => Promise<void>;
  deleteQuestion?: (questionId: string) => void;
}

export const useQuizCardLogic = ({
  initialAnsweredCount = 0,
  questionState,
  loadMore,
  deleteQuestion,
}: UseQuizCardLogicProps) => {
  // 🚀 性能优化：使用 lazy 初始化减少初始渲染延迟
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [cards, setCards] = useState<Question[]>([]);
  const [answeredCount, setAnsweredCount] = useState<number>(initialAnsweredCount);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [dismissedCards, setDismissedCards] = useState<Question[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 跟踪是否正在加载更多数据

  // 监听QuestionContext中的questions变化，同步数据
  useEffect(() => {
    const loadData = () => {
      const questionData = questionState.questions;

      // 🚀 性能优化：使用 startTransition 延迟非关键更新
      startTransition(() => {
        // 只在初次加载数据时应用initialAnsweredCount
        // 当isDataLoaded为false时，表示是初次加载
        if (!isDataLoaded) {
          if (
            initialAnsweredCount > 0 &&
            initialAnsweredCount < questionData.length
          ) {
            const answeredCards = questionData.slice(0, initialAnsweredCount);
            const remainingCards = questionData.slice(initialAnsweredCount);

            setCards(remainingCards);
            setDismissedCards(answeredCards);
            setAnsweredCount(initialAnsweredCount);
          } else {
            setCards(questionData);
          }
        } else {
          // 后续更新时，保留用户当前的进度状态
          // 计算新加入的问题（不在当前cards和dismissedCards中的问题）
          const allCurrentQuestions = [...cards, ...dismissedCards];
          const currentQuestionIds = new Set(
            allCurrentQuestions.map(q => q._id),
          );
          const newQuestions = questionData.filter(
            (q: Question) => !currentQuestionIds.has(q._id),
          );

          if (newQuestions.length > 0) {
            // 将新问题添加到cards数组末尾
            setCards(prevCards => [...prevCards, ...newQuestions]);
          }
        }

        setIsDataLoaded(true);
      });
    };

    // 使用 InteractionManager 在主线程闲置时加载数据
    InteractionManager.runAfterInteractions(() => {
      loadData();
    });
  }, [
    initialAnsweredCount,
    questionState.questions,
    isDataLoaded,
    cards,
    dismissedCards,
  ]);

  const canSwipeBack = useMemo(() => {
    // 只有当有已移除的卡片时才能右滑回退
    return dismissedCards.length > 0;
  }, [dismissedCards]);

  const remainingCards = useMemo(() => {
    // 剩余卡片数量应该是总数量减去已回答的卡片数量（删除的卡片已经在pagination.total中处理了）
    return Math.max(0, questionState.pagination.total - answeredCount);
  }, [questionState.pagination.total, answeredCount]);

  // 检查卡片数量并触发加载更多数据
  const checkAndLoadMoreData = useCallback(async () => {
    // 如果正在加载中，或者没有更多数据，或者剩余卡片数量大于阈值，则不加载
    if (
      isLoadingMore ||
      !questionState.pagination.hasNext ||
      cards.length >= 10
    ) {
      console.log('⏭️ 不满足加载条件，跳过加载');
      return;
    }

    // 当剩余卡片数量少于5张时，触发加载更多
    if (cards.length <= 5) {
      console.log(`📥 剩余卡片数量不足，开始加载更多数据...`);
      setIsLoadingMore(true);
      try {
        await loadMore();
      } catch (error) {
        console.error('加载更多数据失败:', error);
      } finally {
        setIsLoadingMore(false);
      }
    } else {
      console.log(`⏭️ 卡片数量(${cards.length})大于阈值(5)，无需加载更多`);
    }
  }, [isLoadingMore, questionState.pagination.hasNext, cards.length, loadMore]);

  // 监听卡片数量变化，当数量不足时自动加载更多
  useEffect(() => {
    if (isDataLoaded) {
      checkAndLoadMoreData();
    }
  }, [cards.length, isDataLoaded, checkAndLoadMoreData]);

  const onCardDismiss = useCallback(() => {
    setCards(prevCards => {
      if (prevCards.length > 0) {
        const dismissedCard = prevCards[0];
        const newCards = prevCards.slice(1);

        setDismissedCards(prev => [...prev, dismissedCard]);
        console.log(`📊 卡片移除后剩余: ${newCards.length}`);
        return newCards;
      }
      return prevCards;
    });
    setAnsweredCount(prev => {
      const newCount = prev + 1;
      console.log(`📈 已回答题目数: ${newCount}`);
      return newCount;
    });
    setActiveCardIndex(0);
  }, []);

  const onSwipeBack = useCallback(() => {
    setDismissedCards(prevCards => {
      if (prevCards.length > 0) {
        const lastDismissedCard = prevCards[prevCards.length - 1];
        const newDismissedCards = prevCards.slice(0, -1);

        setCards(prevCards => [lastDismissedCard, ...prevCards]);
        console.log(`↩️ 回退到上一张卡片，剩余卡片: ${prevCards.length + 1}`);

        return newDismissedCards;
      }
      return prevCards;
    });

    // 减少已回答计数
    setAnsweredCount(prev => Math.max(0, prev - 1));
  }, []);

  const onCardDelete = useCallback(() => {
    setCards(prevCards => {
      if (prevCards.length > 0) {
        // 获取要删除的卡片ID
        const cardToDelete = prevCards[0];
        // 只从卡片列表中移除第一张卡片，不添加到dismissedCards，也不更新answeredCount
        const newCards = prevCards.slice(1);
        console.log(`🗑️ 卡片被直接删除，剩余: ${newCards.length}`);

        // 同时从questionState中删除该题目
        if (deleteQuestion) {
          deleteQuestion(cardToDelete._id);
        }

        // 调用API记录删除操作
        userActionApiService.recordUserAction(
          undefined, // userId can be undefined for anonymous users
          cardToDelete._id,
          'deleted'
        ).catch(error => {
          console.error('Failed to record delete action:', error);
        });

        return newCards;
      }
      return prevCards;
    });
    setActiveCardIndex(0);
  }, [deleteQuestion]);

  const onCardTouch = useCallback(
    (touchedIndex: number) => {
      if (touchedIndex === activeCardIndex || touchedIndex !== 0) return;
      setActiveCardIndex(0);
    },
    [activeCardIndex],
  );

  return {
    isDataLoaded,
    cards,
    answeredCount,
    activeCardIndex,
    dismissedCards,
    canSwipeBack,
    remainingCards,
    onCardDismiss,
    onSwipeBack,
    onCardDelete,
    onCardTouch,
    setIsDataLoaded,
  };
};