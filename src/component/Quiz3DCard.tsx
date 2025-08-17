'use client';

// SwipeableStack.js
// 一个完整的、可滑动的卡片堆栈组件，类似 Tinder 的"喜欢/不喜欢"功能
// 使用 react-native-gesture-handler 和 react-native-reanimated 实现流畅的手势动画

import React, {useState, useRef, useMemo, useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  cancelAnimation,
  interpolate,
  Extrapolate,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import DATA from './questions';

const {width, height} = Dimensions.get('window');

const ProgressCounter = React.memo(({current, total, answered}) => {
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
});

// ✅ 核心组件：可滑动的卡片
// 为每张卡片创建独立的动画状态，避免状态污染
const SwipeableCard = React.memo(
  ({card, onDismiss, index, totalCards, isActive, onCardTouch}) => {
    // 动画值
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const hasScheduledRemoval = useRef(false);

    const removeCard = useCallback(() => {
      if (hasScheduledRemoval.current) {
        console.log(`❌ 卡片 ${card.id} 阻止了重复移除调用！`);
        return;
      }
      hasScheduledRemoval.current = true;
      console.log(`✅ 卡片 ${card.id} 已从状态中移除`);
      onDismiss();
    }, [card.id, onDismiss]);

    const resetRemovalFlag = useCallback(() => {
      hasScheduledRemoval.current = false;
      console.log(`🔄 卡片 ${card.id} 重置了移除标记`);
    }, [card.id]);

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
            console.log(`🔄 手势开始 - 卡片 ${card.id}，已重置动画值`);
          })
          .onUpdate(event => {
            // 只有活跃卡片才响应手势
            if (!isActive) return;

            translateX.value = event.translationX;
            translateY.value = event.translationY;

            // 优化旋转计算
            rotate.value = interpolate(
              event.translationX,
              [-width * 0.5, 0, width * 0.5],
              [-15, 0, 15],
              Extrapolate.CLAMP,
            );

            // 优化缩放计算
            const distance = Math.sqrt(
              event.translationX ** 2 + event.translationY ** 2,
            );
            const maxDistance = width * 0.6;
            scale.value = interpolate(
              distance,
              [0, maxDistance],
              [1, 0.9],
              Extrapolate.CLAMP,
            );

            // 优化透明度计算
            opacity.value = interpolate(
              Math.abs(event.translationX),
              [0, width * 0.3],
              [1, 0.7],
              Extrapolate.CLAMP,
            );
          })
          .onEnd(event => {
            if (!isActive) return;

            const shouldDismiss =
              Math.abs(event.translationX) > width * 0.25 ||
              Math.abs(event.velocityX) > 800;

            if (shouldDismiss) {
              console.log(`🚀 卡片 ${card.id} 开始移除动画`);
              runOnJS(removeCard)();

              const exitDirection = event.translationX > 0 ? 1 : -1;
              const exitDistance = width * 1.2;

              translateX.value = withSpring(exitDirection * exitDistance, {
                damping: 20,
                stiffness: 200,
                velocity: event.velocityX,
              });

              translateY.value = withSpring(
                event.translationY + (Math.random() - 0.5) * 150,
                {
                  damping: 20,
                  stiffness: 200,
                },
              );

              rotate.value = withSpring(
                exitDirection * (30 + Math.random() * 20),
                {
                  damping: 20,
                  stiffness: 200,
                },
              );

              opacity.value = withTiming(0, {duration: 300});
              scale.value = withSpring(0.8, {damping: 20, stiffness: 200});
            } else {
              translateX.value = withSpring(0, {damping: 25, stiffness: 400});
              translateY.value = withSpring(0, {damping: 25, stiffness: 400});
              rotate.value = withSpring(0, {damping: 25, stiffness: 400});
              scale.value = withSpring(1, {damping: 25, stiffness: 400});
              opacity.value = withSpring(1, {damping: 25, stiffness: 400});
            }
          }),
      [isActive, index, card.id, onCardTouch, removeCard, resetRemovalFlag],
    );

    const animatedStyle = useAnimatedStyle(() => {
      if (!isActive) return {};

      return {
        transform: [
          {translateX: translateX.value},
          {translateY: translateY.value},
          {rotate: `${rotate.value}deg`},
          {scale: scale.value},
        ],
        opacity: opacity.value,
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
        transform: [{translateY: stackIndex * 4}, {translateX: stackIndex * 2}],
        opacity: Math.max(0.3, 1 - stackIndex * 0.15),
      };
    }, [isActive, index]);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.card,
            isActive ? animatedStyle : backgroundStyle,
            {zIndex: Math.min(100 + totalCards - index, 9998)},
          ]}>
          <QuestionCard
            onDislike={() => {}}
            onToggleFavorite={() => {}}
            {...card}
          />
        </Animated.View>
      </GestureDetector>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.index === nextProps.index &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.totalCards === nextProps.totalCards
    );
  },
);

const Quiz3DCard = () => {
  const [cards, setCards] = useState(DATA);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const visibleCards = useMemo(() => {
    const maxVisible = 4; // 只渲染前4张卡片
    return cards.slice(0, maxVisible);
  }, [cards]);

  const onCardDismiss = useCallback(() => {
    setCards(prevCards => {
      if (prevCards.length > 0) {
        const newCards = prevCards.slice(1);
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

  const onCardTouch = useCallback(
    touchedIndex => {
      if (touchedIndex === activeCardIndex || touchedIndex !== 0) return;
      // 只允许触摸最顶层的卡片
      setActiveCardIndex(0);
    },
    [activeCardIndex],
  );

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>🎉 恭喜完成！</Text>
          <Text style={styles.endText}>
            你已经完成了所有 {DATA.length} 道题目！
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <ProgressCounter
        current={cards.length}
        total={DATA.length}
        answered={answeredCount}
      />
      <View style={styles.container}>
        {visibleCards.map((card, index) => (
          <SwipeableCard
            key={`${card.id}-${index}`}
            card={card}
            onDismiss={index === 0 ? onCardDismiss : () => {}}
            index={index}
            totalCards={visibleCards.length}
            isActive={index === activeCardIndex}
            onCardTouch={onCardTouch}
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
    paddingTop: 60,
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
    zIndex: 100,
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
