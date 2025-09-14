import React, {useState, useRef} from 'react';
import {TouchableOpacity, Text, View, SafeAreaView} from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withTiming,
} from 'react-native-reanimated';
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
  const [bottomInset, setBottomInset] = useState(0);
  const safeAreaRef = useRef<View>(null);

  // 获取底部安全区域高度
  const handleSafeAreaLayout = () => {
    if (safeAreaRef.current) {
      safeAreaRef.current.measure((fx, fy, width, height, px, py) => {
        // 计算底部安全区域高度
        const screenHeight = height + fy;
        const safeAreaHeight = height;
        const bottomSafeArea = screenHeight - safeAreaHeight;
        setBottomInset(bottomSafeArea);
      });
    }
  };

  // 创建动画样式 - 使用条件渲染彻底解决视觉残留
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: navOpacity.value,
      transform: [{translateY: navTranslateYBottom.value}],
      // 当透明度接近0时完全隐藏容器
      display: navOpacity.value > 0.02 ? 'flex' : 'none',
    };
  });

  // 动态计算PlayButton的位置，考虑底部导航栏高度和安全区域
  const playButtonStyle = {
    ...styles.playButtonContainer,
    bottom: 60 + bottomInset, // 底部导航栏高度(60) + 底部安全区域高度
  };

  return (
    <>
      {/* 隐藏的SafeAreaView用于获取安全区域尺寸 */}
      <SafeAreaView
        ref={safeAreaRef}
        style={{position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0}}
        onLayout={handleSafeAreaLayout}
      />
      <Animated.View style={[playButtonStyle, animatedStyle]}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Text style={styles.playButtonText}>{isPlaying ? '停' : '听'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};
