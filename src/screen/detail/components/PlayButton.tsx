import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Animated, {useAnimatedStyle, SharedValue, withTiming} from 'react-native-reanimated';
import {styles} from '../styles/styles';

interface PlayButtonProps {
  navOpacity: SharedValue<number>;
  navTranslateYBottom: SharedValue<number>;
  handlePlayPause: () => void;
  isPlaying: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  navOpacity,
  navTranslateYBottom,
  handlePlayPause,
  isPlaying,
}) => {
  // 创建动画样式 - 使用条件渲染彻底解决视觉残留
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYBottom.value}],
      // 当透明度接近0时完全隐藏容器
      display: navOpacity.value > 0.02 ? 'flex' : 'none',
    };
  });

  return (
    <Animated.View
      style={[
        styles.playButtonContainer,
        animatedStyle,
      ]}>
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
        <Text style={styles.playButtonText}>{isPlaying ? '停' : '听'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
