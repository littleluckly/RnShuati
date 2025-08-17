import React, {useRef} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {SharedValue, useAnimatedStyle} from 'react-native-reanimated';

interface Props {
  id: string;
  title: string;
  subtitle?: string;
  activeId: SharedValue<string>;
  onPress?: () => void;
}

export const QuizListItem = ({title, onPress, id, activeId}: Props) => {
  const swipeRef = useRef(null);

  /* ===== 右侧按钮（带淡入动画和裁剪） ===== */
  const RightActions = (
    progress: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      // 使用 progress 控制透明度：从 0 → 1 淡入
      const opacity = Math.max(0, Math.min(1, progress.value));
      return {
        // transform: [{translateX: drag.value}],
        transform: [{translateX: 0}],
        opacity, // ✅ 关键：避免初始闪现
      };
    });

    return (
      // ✅ 外层容器：裁剪溢出内容
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          justifyContent: 'flex-end',
          flexDirection: 'row',
        }}>
        <Animated.View style={[styles.rightActions, animatedStyle]}>
          {['收藏', '编辑', '不喜欢'].map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.action,
                {backgroundColor: ['#4CAF50', '#2196F3', '#F44336'][idx]},
              ]}
              onPress={() => {
                console.log(`${label} ${id}`);
                // 可选：操作后自动关闭
                // @ts-ignore
                swipeRef.current?.close();
              }}>
              <Text style={styles.actionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    );
  };

  /* 单击主卡片 */
  const handlePress = () => {
    onPress?.();
    console.log(`进入 ${title}`);
  };

  /* 打开/关闭回调 */
  const onSwipeableOpen = () => {
    console.log('onSwipeableOpen', id);
  };

  const onSwipeableClose = () => {};

  return (
    <View style={styles.swipeItemWrap}>
      <ReanimatedSwipeable
        ref={swipeRef}
        renderRightActions={RightActions}
        friction={2}
        rightThreshold={40}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableClose={onSwipeableClose}>
        {/* 主内容区域：提升 zIndex 防止被覆盖 */}
        <TouchableOpacity onPress={handlePress} style={styles.container}>
          <View style={styles.iconContainer}>
            <Image
              source={{uri: 'https://example.com/icon.png'}}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={styles.titleText}
              numberOfLines={3}
              ellipsizeMode="tail">
              {title}
            </Text>
          </View>
          <View style={styles.lockContainer}>
            <Image
              source={{uri: 'https://example.com/lock.png'}}
              style={styles.lockIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeItemWrap: {
    marginTop: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4, // 🔁 可尝试注释掉，避免 Android 层级冲突
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // ✅ 核心修复：提升主内容层级
    zIndex: 1,
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  // ✅ 修正：使用正确的 title 样式
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lockContainer: {
    backgroundColor: '#ffebcd',
    borderRadius: 12,
    padding: 8,
  },
  lockIcon: {
    width: 24,
    height: 24,
  },
  rightActions: {
    flexDirection: 'row',
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: '100%',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
