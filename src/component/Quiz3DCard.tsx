// SwipeableStack.js
// 一个完整的、可滑动的卡片堆栈组件，类似 Tinder 的“喜欢/不喜欢”功能
// 使用 react-native-gesture-handler 和 react-native-reanimated 实现流畅的手势动画

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform, // 用于检测平台
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming, // 使用 withTiming 实现快速、可预测的动画
  runOnJS, // 将函数调用从动画线程调度到 JS 线程
  cancelAnimation, // 关键：立即中断正在进行的动画
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView, // 推荐的根容器，确保手势正常工作
} from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import DATA from './questions';

// 获取屏幕尺寸
const {width, height} = Dimensions.get('window');

// ✅ 核心组件：可滑动的卡片
// 为每张卡片创建独立的动画状态，避免状态污染
const SwipeableCard = ({card, onDismiss, index}) => {
  // --- 动画值 (每个卡片独立拥有) ---
  // 这些值在动画线程中更新，实现 60fps 流暢动画
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue('0deg');
  const scale = useSharedValue(1);

  // --- 防重复调用标记 (使用 useRef) ---
  // 由于 onDismiss 可能被多次调用（理论上），用 ref 防止重复状态更新
  // ref 的值在组件整个生命周期内保持不变，不受重渲染影响
  const hasScheduledRemoval = useRef(false);

  // --- 移除卡片的回调函数 ---
  // 使用 useCallback 确保函数引用稳定，避免不必要的重新创建
  const removeCard = React.useCallback(() => {
    if (hasScheduledRemoval.current) {
      console.log(`❌ 卡片 ${card.id} 阻止了重复移除调用！`);
      return; // 如果已计划移除，则直接返回，防止多次调用 setCards
    }
    hasScheduledRemoval.current = true; // 标记为已计划移除
    console.log(`✅ 卡片 ${card.id} 已从状态中移除`);
    // runOnJS 确保 onDismiss 在 JS 线程执行
    runOnJS(onDismiss)();
  }, [card.id, onDismiss]);

  // --- 重置移除标记 ---
  // 通常在卡片被卸载时调用，但在此模式下主要用于调试
  const resetRemovalFlag = React.useCallback(() => {
    hasScheduledRemoval.current = false;
    console.log(`🔄 卡片 ${card.id} 重置了移除标记`);
  }, [card.id]);

  // --- 手势处理器 ---
  // 使用 Pan 手势（拖拽手势）
  const gesture = Gesture.Pan()
    // --- 手势开始 ---
    .onStart(() => {
      // 🔑 关键步骤 1: 立即取消任何正在进行的动画
      // 如果上一次有弹回动画 (withTiming) 正在执行，它会“霸占” sharedValue
      // cancelAnimation 确保新的手势能立即、完全地控制卡片
      // 这是解决“需要多次滑动才响应”问题的核心
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(rotate);
      cancelAnimation(scale);

      // 🔑 关键步骤 2: 强制重置所有动画值到初始状态
      // 即使 cancelAnimation 已经中断了动画，我们仍然需要将值设为 0
      // 确保手势从“干净”的状态开始
      translateX.value = 0;
      translateY.value = 0;
      rotate.value = '0deg';
      scale.value = 1;

      // 重置防重复标记（理论上在卡片创建时已重置，这里双重保险）
      runOnJS(resetRemovalFlag)();
      console.log(`🔄 手势开始 - 卡片 ${card.id}，已重置动画值`);
    })
    // --- 手势更新 (手指移动时) ---
    .onUpdate(event => {
      // 根据手指移动距离更新动画值
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // 旋转角度与 X 位移成正比，增加视觉反馈
      rotate.value = `${event.translationX * 0.2}deg`;
      // 计算手指移动的总距离
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2,
      );
      // 距离越远，卡片缩放越小（最小 0.9），提供深度感
      scale.value = Math.max(1 - distance / 300, 0.9);
    })
    // --- 手势结束 (手指抬起时) ---
    .onEnd(event => {
      // 判断是否应该移除卡片：X 方向移动距离超过屏幕宽度的 40%
      const shouldDismiss = Math.abs(event.translationX) > width * 0.2;

      if (shouldDismiss) {
        console.log(`🚀 卡片 ${card.id} 开始移除动画`);

        // ✅ 优化策略：立即更新状态，提供即时反馈
        // 虽然动画可能被截断，但用户体验是“滑一下就没了”，非常流畅
        // 这是大多数社交应用（如 Tinder）采用的模式
        runOnJS(removeCard)(); // 👈 立即调用，不再等待动画完成
        console.log(`✅ 卡片 ${card.id} 状态已立即移除`);

        // 启动快速移除动画 (withTiming)，即使组件可能被卸载
        // 使用较短的持续时间 (300ms)，确保动画能快速开始
        // 注意：一旦 removeCard() 执行，SwipeableCard 组件会被 React 卸载
        // 因此，这个动画可能在完成前就被中断，但用户通常感知不到
        translateX.value = withTiming(
          event.translationX > 0 ? width * 2 : -width * 2, // 飞出屏幕外
          {duration: 300},
          // ❌ 移除了完成回调，因为我们已经立即移除了状态
          // (finished) => { if (finished) { removeCard(); } }
        );
      } else {
        // 手势未达到移除阈值，卡片弹回原位
        // 🔑 同样，先取消可能存在的动画，再启动新的弹回动画
        cancelAnimation(translateX);
        cancelAnimation(translateY);
        cancelAnimation(rotate);
        cancelAnimation(scale);

        // 启动弹回动画
        translateX.value = withTiming(0, {duration: 200});
        translateY.value = withTiming(0, {duration: 200});
        rotate.value = withTiming('0deg', {duration: 200});
        scale.value = withTiming(1, {duration: 200});
      }
    });

  // --- 动态样式 ---
  // useAnimatedStyle 将 sharedValue 转换为可在 Animated.View 上使用的样式
  // 这个函数在动画线程中运行，性能极高
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {rotate: rotate.value},
      {scale: scale.value},
    ],
  }));

  // --- 渲染 ---
  // 使用 GestureDetector 包裹 Animated.View
  // key={card.id} 确保当顶层卡片改变时，React 会创建一个新的 SwipeableCard 实例
  // 这保证了每张新卡片都拥有全新的、重置过的动画状态
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle, {zIndex: index}]}>
        <QuestionCard
          onDislike={() => {}}
          onToggleFavorite={() => {}}
          {...card}
        />
      </Animated.View>
    </GestureDetector>
  );
};

// --- 主组件 ---
const Quiz3DCard = () => {
  // 管理卡片数据的状态
  const [cards, setCards] = useState(DATA);

  // --- 移除卡片的回调 ---
  // 使用 useCallback 缓存函数，避免在每次渲染时重新创建
  // 这对于传递给子组件（如 SwipeableCard）很重要
  const onCardDismiss = React.useCallback(() => {
    setCards(prevCards => {
      if (prevCards.length > 0) {
        const newCards = prevCards.slice(1);
        return newCards;
      }
      return prevCards; // 安全兜底
    });
  }, []);

  // 如果没有卡片了，显示结束提示
  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.endText}>太棒了！你已经滑完了所有卡片！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 背景卡片 (非交互) */}
      {cards.slice(1)?.map((card, index) => (
        // 使用 card.id 作为 key，确保列表更新的稳定性
        <View
          key={card.id}
          style={[
            styles.card,
            styles.backgroundCard,
            {
              zIndex: cards.length - index - 1, // 确保正确的堆叠顺序
            },
          ]}>
          <QuestionCard
            onDislike={() => {}}
            onToggleFavorite={() => {}}
            {...card}
          />
        </View>
      ))}
      {/* 最顶层的可交互卡片 */}
      {/* key={cards[cards.length - 1].id} 是关键！ */}
      {/* 当顶层卡片 ID 改变时，React 会卸载旧的 SwipeableCard 并创建一个新的 */}
      {/* 这确保了新的卡片拥有全新的动画状态，解决了“状态复用”问题 */}

      <SwipeableCard
        key={cards[0].id}
        card={cards[0]}
        onDismiss={onCardDismiss}
        index={cards.length - 1}
      />
    </View>
  );
};

// --- 样式 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    // width: width * 0.9,
    // height: height * 0.7,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden', // 确保内容不超出圆角
    position: 'absolute', // 使用绝对定位堆叠卡片
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android 阴影
  },
  backgroundCard: {
    // 背景卡片的特殊样式（如果需要）
    // 这里主要靠内联样式控制层次
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  endText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    margin: 20,
  },
});

// 导出组件
export default Quiz3DCard;
