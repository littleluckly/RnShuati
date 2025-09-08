import React, {useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
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
import {SwipeableCardProps} from '../types';
import {showSwipeLimitToast} from '@/utils/toastUtils';
import {useSharedTransition} from '@/contexts/sharedTransitionContext';
import {SharedElement} from '@/contexts/ShareElement';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

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
    const heightValue = useSharedValue(
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
          heightValue.value = withSpring(
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

    const animatedSharedElementStyle = useAnimatedStyle(() => {
      return {
        opacity: sharedElementOpacity.value,
        transform: [
          {translateX: translateX.value},
          {translateY: translateY.value},
          {rotate: `${rotate.value}deg`},
          // {scale: scale.value},
        ],
        top: top.value,
        height: heightValue.value,
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
        height: heightValue.value,
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
              style={animatedSharedElementStyle}
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

const styles = StyleSheet.create({
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
});

export default SwipeableCard;
