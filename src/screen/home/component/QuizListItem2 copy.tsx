import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  id: string;
  title: string;
  subtitle?: string;
  activeId: SharedValue<string>;
  onPress?: () => void;
}
export const QuizListItem = ({title, onPress, id, activeId}: Props) => {
  const swipeRef = useRef(null);

  /* ===== 右侧按钮 ===== */
  const RightActions = (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      // 从右侧滑出时，progress 从 0 → 1
      return {
        transform: [{translateX: drag.value}],
        opacity: prog.value, // ✅ 淡入效果
      };
    });
    return (
      <Animated.View
        style={[styles.rightActions, animatedStyle, {overflow: 'hidden'}]}>
        {['收藏', '编辑', '不喜欢'].map((label, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.action,
              {backgroundColor: ['#4CAF50', '#2196F3', '#F44336'][idx]},
            ]}
            onPress={() => console.log(`${label} ${id}`)}>
            <Text style={styles.actionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };
  /* 单击主卡片 → 跳转 */
  const handlePress = () => {
    // 例：navigation.navigate('Detail', { id });
    console.log(`进入 ${title}`);
  };

  /* 打开/关闭回调 */
  const onSwipeableOpen = () => {
    console.log('onSwipeableOpen', id);
  };
  const onSwipeableClose = () => {};

  return (
    <View style={[styles.swipeItemWrap]}>
      <ReanimatedSwipeable
        ref={swipeRef}
        renderRightActions={RightActions}
        friction={2}
        rightThreshold={40}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableClose={onSwipeableClose}>
        <TouchableOpacity onPress={onPress} style={styles.container}>
          <View style={styles.iconContainer}>
            <Image
              source={{uri: 'https://example.com/icon.png'}} // 替换为实际的图标 URL
              style={styles.icon}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={styles.subtitle}
              numberOfLines={3}
              ellipsizeMode="tail">
              {title}
            </Text>
          </View>
          <View style={styles.lockContainer}>
            <Image
              source={{uri: 'https://example.com/lock.png'}} // 替换为实际的锁图标 URL
              style={styles.lockIcon}
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
    // overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // ✅ 移除 elevation，仅用 shadow
    // elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    // marginVertical: 8,
    // marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    // ✅ 关键：提升主内容层级
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
  listContainer: {
    paddingHorizontal: 16,
  },
  rightActions: {flexDirection: 'row'},
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
});
