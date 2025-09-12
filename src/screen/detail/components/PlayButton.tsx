import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import Animated, {useAnimatedStyle, SharedValue} from 'react-native-reanimated';
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
  // 创建动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYBottom.value}],
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
