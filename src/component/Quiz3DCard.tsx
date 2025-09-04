'use client';

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  startTransition,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  cancelAnimation,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import {ProgressCounterProps, SwipeableCardProps} from './types';
import {showSwipeLimitToast} from '@/utils/toastUtils';
import {useSharedTransition} from '@/contexts/sharedTransitionContext';
import {SharedElement} from '@/contexts/ShareElement';
import {useQuestionContext} from '@/contexts/QuestionContext';
import {Question} from '@/services/apiTypes';
// 导入导航栏高度hook
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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

const ProgressCounter = React.memo(
  ({current, total, answered}: ProgressCounterProps) => {
    const remaining = current;
    const progress = (answered / total) * 100;

    return (
      <View style={styles.counterContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>
        <Text style={styles.counterText}>
          进度: {answered}/{total} · 剩余 {remaining} 张
        </Text>
      </View>
    );
  },
);

// ✅ 核心组件：可滑动的卡片
const SwipeableCard = React.memo(
  ({
    question: questionMeta,
    onDismiss,
    onCardDelete,
    onSwipeBack,
    index,
    totalCards,
    isActive,
    onCardTouch,
    canSwipeBack,
    sourceLayout,
  }: SwipeableCardProps) => {
    const {height: screenHeight} = Dimensions.get('window');
    // 🔧 修复 Reanimated 错误：提取基本类型的 id 避免在 worklet 中访问复杂对象
    const cardId = questionMeta.id;
    // 动画值
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
    const scale = useSharedValue(
      sourceLayout ? sourceLayout.width / (width * 0.9) : 1,
    );
    const {state, dispatch} = useSharedTransition();
    const sharedElementOpacity = useSharedValue(state.isTransitioning ? 1 : 0);
    const opacity = useSharedValue(1);
    const targetHeight = screenHeight - 220;
    const height = useSharedValue(
      state.isTransitioning ? sourceLayout?.height || 0 : targetHeight,
    );
    // 在组件中获取导航栏高度
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();
    // 计算实际需要补偿的高度
    const topOffset = headerHeight + (insets.top || 0);
    //sourceLayout.y计算的是相对屏幕坐标，共享元素的top要扣除导航栏和状态栏高度
    const pageY = sourceLayout?.y || 0;
    const top = useSharedValue(state.isTransitioning ? pageY - topOffset : 80);

    // 从sourceLayout位置平滑过渡到正常位置
    React.useEffect(() => {
      setTimeout(() => {
        if (sourceLayout && isActive && state.isTransitioning) {
          sharedElementOpacity.value = withTiming(0, {duration: 200});
          height.value = withSpring(
            targetHeight,
            {
              damping: 20,
              stiffness: 200,
            },
            finished => {
              if (finished) {
                runOnJS(dispatch)({type: 'STOP'});
                console.log('高度动画完成');
              }
            },
          );
          // 80 卡片距离顶部高度
          top.value = withSpring(80, {
            damping: 20,
            stiffness: 200,
          });
        }
      }, 350);

      () => {
        dispatch({type: 'STOP'});
      };
    }, [sourceLayout, isActive, state.isTransitioning]);

    const hasScheduledRemoval = useRef(false);

    const removeCard = useCallback(() => {
      if (hasScheduledRemoval.current) {
        console.log(`❌ 卡片 ${cardId} 阻止了重复移除调用！`);
        return;
      }
      hasScheduledRemoval.current = true;
      console.log(`✅ 卡片 ${cardId} 已从状态中移除`);
      onDismiss();
    }, [cardId, onDismiss]);

    const swipeBackCard = useCallback(() => {
      if (hasScheduledRemoval.current) {
        console.log(`❌ 卡片 ${cardId} 阻止了重复回退调用！`);
        return;
      }
      hasScheduledRemoval.current = true;
      console.log(`↩️ 卡片 ${cardId} 已回退`);
      onSwipeBack?.();
    }, [cardId, onSwipeBack]);

    const resetRemovalFlag = useCallback(() => {
      hasScheduledRemoval.current = false;
      console.log(`🔄 卡片 ${cardId} 重置了移除标记`);
    }, [cardId]);

    const gesture = useMemo(
      () =>
        Gesture.Pan()
          .onStart(() => {
            runOnJS(onCardTouch)(index);

            // 只有活跃卡片才执行动画重置
            if (isActive) {
              cancelAnimation(translateX);
              cancelAnimation(translateY);
              cancelAnimation(rotate);
              cancelAnimation(scale);
              cancelAnimation(opacity);

              translateX.value = 0;
              translateY.value = 0;
              rotate.value = 0;
              scale.value = 1;
              opacity.value = 1;
            }

            runOnJS(resetRemovalFlag)();
            console.log(`🔄 手势开始 - 卡片 ${cardId}，已重置动画值`);
          })
          .onUpdate(event => {
            // 只有活跃卡片才响应手势
            if (!isActive) return;

            // 如果是第一张卡片且不能右滑，限制向右滑动
            if (event.translationX > 0 && !canSwipeBack) {
              runOnJS(showSwipeLimitToast)();
              translateX.value = 0;
              translateY.value = event.translationY;
              return;
            }

            translateX.value = event.translationX;
            translateY.value = event.translationY;

            // 根据滑动方向计算旋转角度（左滑向左偏，右滑向右偏）
            rotate.value = interpolate(
              event.translationX,
              [-width * 0.5, 0, width * 0.5],
              [-15, 0, 15],
              Extrapolation.CLAMP,
            );

            // 滑动距离越远，卡片越小
            const distance = Math.sqrt(
              event.translationX ** 2 + event.translationY ** 2,
            );
            const maxDistance = width * 0.6;
            scale.value = interpolate(
              distance,
              [0, maxDistance],
              [1, 0.9],
              Extrapolation.CLAMP,
            );

            // 滑动距离越远，透明度越低
            opacity.value = interpolate(
              Math.abs(event.translationX),
              [0, width * 0.3],
              [1, 0.7],
              Extrapolation.CLAMP,
            );
          })
          .onEnd(event => {
            if (!isActive) return;

            // 左滑判断：向左滑动距离足够或速度足够快
            const shouldGoToNext =
              event.translationX < -width * 0.25 || event.velocityX < -800;

            // 右滑判断：向右滑动距离足够且允许回退
            const shouldGoToPrevious =
              event.translationX > width * 0.25 && canSwipeBack;

            if (shouldGoToPrevious) {
              // 向右滑动 - 回到上一张卡片
              console.log(`↩️ 向右滑动 - 回退到上一张卡片 ${cardId}`);
              runOnJS(swipeBackCard)();

              // 向右退出动画
              translateX.value = withSpring(width * 1.2, {
                damping: 20,
                stiffness: 200,
                velocity: event.velocityX,
              });
              translateY.value = withSpring(
                event.translationY + (Math.random() - 0.5) * 150,
                {damping: 20, stiffness: 200},
              );
              rotate.value = withSpring(30 + Math.random() * 20, {
                damping: 20,
                stiffness: 200,
              });
              opacity.value = withTiming(0, {duration: 300});
              scale.value = withSpring(0.8, {damping: 20, stiffness: 200});
            } else if (shouldGoToNext) {
              // 向左滑动 - 前进到下一张卡片
              console.log(`➡️ 向左滑动 - 前进到下一张卡片 ${cardId}`);
              runOnJS(removeCard)();

              // 向左退出动画
              translateX.value = withSpring(-width * 1.2, {
                damping: 20,
                stiffness: 200,
                velocity: event.velocityX,
              });
              translateY.value = withSpring(
                event.translationY + (Math.random() - 0.5) * 150,
                {damping: 20, stiffness: 200},
              );
              rotate.value = withSpring(-30 - Math.random() * 20, {
                damping: 20,
                stiffness: 200,
              });
              opacity.value = withTiming(0, {duration: 300});
              scale.value = withSpring(0.8, {damping: 20, stiffness: 200});
            } else {
              // 滑动距离不足，回到原位
              translateX.value = withSpring(0, {damping: 25, stiffness: 400});
              translateY.value = withSpring(0, {damping: 25, stiffness: 400});
              rotate.value = withSpring(0, {damping: 25, stiffness: 400});
              scale.value = withSpring(1, {damping: 25, stiffness: 400});
              opacity.value = withSpring(1, {damping: 25, stiffness: 400});
            }
          }),
      [
        isActive,
        index,
        cardId,
        onCardTouch,
        removeCard,
        swipeBackCard,
        resetRemovalFlag,
        canSwipeBack,
        onCardDelete,
      ],
    );

    const animatedSharedElementStye = useAnimatedStyle(() => {
      return {
        opacity: sharedElementOpacity.value,
        transform: [
          {translateX: translateX.value},
          {translateY: translateY.value},
          {rotate: `${rotate.value}deg`},
          // {scale: scale.value},
        ],
        top: top.value,
        height: height.value,
        bottom: 80,
      };
    });
    const animatedStyle = useAnimatedStyle(() => {
      if (!isActive) return {};

      return {
        transform: [
          {translateX: translateX.value},
          {translateY: translateY.value},
          {rotate: `${rotate.value}deg`},
          // {scale: scale.value},
        ],
        top: top.value,
        height: height.value,
        bottom: 80,
        // opacity: opacity.value,
      };
    }, [isActive]);

    const backgroundStyle = useAnimatedStyle(() => {
      if (isActive) return {};

      const stackIndex = index;
      const maxVisible = 3;

      if (stackIndex >= maxVisible) {
        return {
          opacity: 0,
          transform: [{scale: 0.7}, {translateY: -20}],
        };
      }

      return {
        transform: [{translateY: stackIndex * 4}, {translateX: stackIndex * 4}],
        opacity: Math.max(0.3, 1 - stackIndex * 0.15),
      };
    }, [isActive, index]);

    return (
      <GestureDetector gesture={gesture}>
        <>
          {state.isTransitioning && (
            <SharedElement
              style={animatedSharedElementStye}
              question={questionMeta.question_markdown}
              sourceLayout={sourceLayout!}></SharedElement>
          )}
          <Animated.View
            style={[
              styles.card,
              isActive ? animatedStyle : backgroundStyle,
              {zIndex: Math.min(100 + totalCards - index, 9998)},
            ]}>
            <QuestionCard
              id={questionMeta.id}
              question={questionMeta.question_markdown}
              simpleAnswer={questionMeta.answer_simple_markdown}
              analysisAnswer={questionMeta.answer_analysis_markdown}
              onToggleFavorite={() => {}}
              onDelete={onCardDelete}
            />
          </Animated.View>
        </>
      </GestureDetector>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.question._id === nextProps.question._id &&
      prevProps.index === nextProps.index &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.totalCards === nextProps.totalCards &&
      prevProps.canSwipeBack === nextProps.canSwipeBack
    );
  },
);

const Quiz3DCard = (
  {
    initialAnsweredCount = 0,
    startFromQuestion,
    sourceLayout,
  }: Quiz3DCardProps = {} as Quiz3DCardProps,
) => {
  const {state} = useSharedTransition();
  const {state: questionState, loadMore, deleteQuestion} = useQuestionContext();

  // 🚀 性能优化：使用 lazy 初始化减少初始渲染延迟
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [cards, setCards] = useState<Question[]>([]);
  const [answeredCount, setAnsweredCount] =
    useState<number>(initialAnsweredCount);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [dismissedCards, setDismissedCards] = useState<Question[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 跟踪是否正在加载更多数据

  // 监听QuestionContext中的questions变化，同步数据
  React.useEffect(() => {
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
            q => !currentQuestionIds.has(q._id),
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

  // const [isTransitioning, setIsTransitioning] = useState(true);
  const visibleCards = useMemo(() => {
    console.log('visibleCards-isTransitioning', state.isTransitioning);
    if (state.isTransitioning) {
      return cards.slice(0, 1);
    }
    const maxVisible = 4;
    return cards.slice(0, maxVisible);
  }, [cards, state.isTransitioning]);

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
  counterContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e1e8ed',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1da1f2',
    borderRadius: 3,
  },
  counterText: {
    fontSize: 15,
    color: '#657786',
    fontWeight: '600',
  },
  card: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    top: 80, // 添加顶部偏移，确保卡片不与计数器重叠
    zIndex: 100, // 降低卡片的 zIndex，确保计数器能显示在上方
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
