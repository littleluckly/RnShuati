'use client';

import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useSharedTransition} from '@/contexts/sharedTransitionContext';
import {useQuestionContext} from '@/contexts/QuestionContext';
import ProgressCounter from './ProgressCounter';
import SwipeableCard from './SwipeableCard';
import {useQuizCardLogic} from './useQuizCardLogic';

const {width, height} = Dimensions.get('window');

// Quiz3DCard 组件的属性接口
interface Quiz3DCardProps {
  initialAnsweredCount?: number; // 初始已回答题目数
  startFromQuestion?: string; // 从哪个题目开始（暂时保留，可用于未来定位到特定题目）
  sourceLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const Quiz3DCard = (
  {
    initialAnsweredCount = 0,
    startFromQuestion,
    sourceLayout,
  }: Quiz3DCardProps = {} as Quiz3DCardProps,
) => {
  const {state} = useSharedTransition();
  const {state: questionState, loadMore, deleteQuestion} = useQuestionContext();

  const {
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
  } = useQuizCardLogic({
    initialAnsweredCount,
    questionState,
    loadMore,
    deleteQuestion,
  });

  const visibleCards = useMemo(() => {
    console.log('visibleCards-isTransitioning', state.isTransitioning);
    if (state.isTransitioning) {
      return cards.slice(0, 1);
    }
    const maxVisible = 4;
    return cards.slice(0, maxVisible);
  }, [cards, state.isTransitioning]);

  // 🚀 性能优化：显示加载状态
  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1da1f2" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>🎉 恭喜完成！</Text>
          <Text style={styles.endText}>
            你已经完成了所有 {answeredCount} 道题目！
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {
        <ProgressCounter
          current={remainingCards}
          total={questionState.pagination.total} // 总数直接使用pagination.total，因为context已经处理了删除
          answered={answeredCount}
        />
      }
      <View style={styles.container}>
        {visibleCards.map((question, index) => (
          <SwipeableCard
            key={`${question._id}-${index}`}
            question={question}
            onDismiss={index === 0 ? onCardDismiss : () => {}}
            onSwipeBack={index === 0 ? onSwipeBack : () => {}}
            onCardDelete={index === 0 ? onCardDelete : () => {}}
            index={index}
            totalCards={visibleCards.length}
            isActive={index === activeCardIndex}
            onCardTouch={onCardTouch}
            canSwipeBack={index === 0 ? canSwipeBack : false}
            sourceLayout={index === 0 ? sourceLayout : undefined}
          />
        ))}
      </View>
    </>
  );
};

// 样式保持不变
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  // 🚀 性能优化：加载状态样式
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    width: '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#657786',
    fontWeight: '500',
  },
  completionContainer: {
    alignItems: 'center',
    padding: 40,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1da1f2',
    marginBottom: 16,
  },
  endText: {
    fontSize: 18,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Quiz3DCard;
