import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  id: string;
  title: string;
  activeId: Animated.SharedValue<string | null>;
}

export const SwipeRow = ({id, title, activeId}: Props) => {
  const translateX = useSharedValue(0);

  /* 手势：横向滑 */
  const gesture = Gesture.Pan()
    .activeOffsetX([-40, 40])
    .failOffsetY([-40, 40])
    .onUpdate(e => {
      'worklet';
      translateX.value = Math.max(-80, Math.min(0, e.translationX));
    })
    .onEnd(() => {
      'worklet';
      if (translateX.value < -40) {
        translateX.value = withSpring(-80);
        activeId.value = id;
      } else {
        translateX.value = withSpring(0);
      }
    });

  /* 监听 activeId：不是自己立即复位 */
  const animatedStyle = useAnimatedStyle(() => {
    if (activeId.value !== id && translateX.value !== 0) {
      translateX.value = 0; // 直接跳回
    }
    return {transform: [{translateX: translateX.value}]};
  });

  /* 右侧按钮 */
  const buttons = (
    <View style={styles.rightActions}>
      {['收藏', '编辑', '删除'].map((t, i) => (
        <View
          key={t}
          style={[
            styles.btn,
            {backgroundColor: ['#4caf50', '#2196f3', '#f44336'][i]},
          ]}>
          <Text style={styles.btnText}>{t}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {buttons}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.row, animatedStyle]}>
          <Text style={styles.title}>{title}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {position: 'relative', marginVertical: 6, marginHorizontal: 12},
  row: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {fontSize: 16, color: '#333'},
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {color: '#fff', fontSize: 12},
});
