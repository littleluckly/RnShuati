import React, {useState, useRef, useEffect} from 'react';
import {TouchableOpacity, Text, View, SafeAreaView, Platform, ActivityIndicator} from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useSharedValue,
  withDelay,
  useAnimatedGestureHandler,
  runOnJS
} from 'react-native-reanimated';
import {PanGestureHandler, PanGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {styles} from '../styles/styles';

interface PlayButtonProps {
  navOpacity: SharedValue<number>;
  navTranslateYBottom: SharedValue<number>;
  handlePlayPause: () => void;
  isPlaying: boolean;
  downloadingItems: Set<string>;
  downloadProgress: Record<string, number>;
  questionId: string;
}

// 音频波形动画组件
const AudioWaveform: React.FC<{isPlaying: boolean}> = ({isPlaying}) => {
  // 创建5个柱状条的高度动画值
  const bar1Height = useSharedValue(0);
  const bar2Height = useSharedValue(0);
  const bar3Height = useSharedValue(0);
  const bar4Height = useSharedValue(0);
  const bar5Height = useSharedValue(0);

  // 定义波形动画序列
  const startWaveformAnimation = () => {
    if (!isPlaying) return;

    // 为每个柱状条创建不同的动画序列，形成波动效果
    bar1Height.value = withRepeat(
      withSequence(
        withTiming(20, {duration: 300, easing: Easing.ease}),
        withTiming(10, {duration: 400, easing: Easing.ease}),
        withTiming(15, {duration: 350, easing: Easing.ease}),
        withTiming(5, {duration: 500, easing: Easing.ease})
      ),
      -1, // 无限重复
      true // 反向
    );

    bar2Height.value = withRepeat(
      withSequence(
        withDelay(100, withTiming(10, {duration: 300, easing: Easing.ease})),
        withTiming(20, {duration: 400, easing: Easing.ease}),
        withTiming(5, {duration: 350, easing: Easing.ease}),
        withTiming(15, {duration: 500, easing: Easing.ease})
      ),
      -1,
      true
    );

    bar3Height.value = withRepeat(
      withSequence(
        withDelay(200, withTiming(15, {duration: 300, easing: Easing.ease})),
        withTiming(5, {duration: 400, easing: Easing.ease}),
        withTiming(20, {duration: 350, easing: Easing.ease}),
        withTiming(10, {duration: 500, easing: Easing.ease})
      ),
      -1,
      true
    );

    bar4Height.value = withRepeat(
      withSequence(
        withDelay(150, withTiming(5, {duration: 300, easing: Easing.ease})),
        withTiming(15, {duration: 400, easing: Easing.ease}),
        withTiming(10, {duration: 350, easing: Easing.ease}),
        withTiming(20, {duration: 500, easing: Easing.ease})
      ),
      -1,
      true
    );

    bar5Height.value = withRepeat(
      withSequence(
        withDelay(250, withTiming(10, {duration: 300, easing: Easing.ease})),
        withTiming(5, {duration: 400, easing: Easing.ease}),
        withTiming(15, {duration: 350, easing: Easing.ease}),
        withTiming(20, {duration: 500, easing: Easing.ease})
      ),
      -1,
      true
    );
  };

  // 重置波形动画
  const resetWaveformAnimation = () => {
    bar1Height.value = withTiming(0, {duration: 200});
    bar2Height.value = withTiming(0, {duration: 200});
    bar3Height.value = withTiming(0, {duration: 200});
    bar4Height.value = withTiming(0, {duration: 200});
    bar5Height.value = withTiming(0, {duration: 200});
  };

  // 根据播放状态控制动画
  React.useEffect(() => {
    if (isPlaying) {
      startWaveformAnimation();
    } else {
      resetWaveformAnimation();
    }
  }, [isPlaying]);

  // 创建柱状条的动画样式
  const createBarStyle = (height: SharedValue<number>, index: number) => {
    return useAnimatedStyle(() => {
      return {
        height: height.value,
        width: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        marginHorizontal: 1,
        opacity: isPlaying ? 1 : 0,
        // 调整transform以确保波形在容器中垂直居中
        transform: [
          {translateY: -(height.value / 2)}
        ],
        // 设置柱状条的对齐方式为底部，确保从中间向上生长
        alignSelf: 'flex-end'
      };
    });
  };

  return (
    <Animated.View style={styles.waveformContainer}>
      <Animated.View style={[createBarStyle(bar1Height, 0)]} />
      <Animated.View style={[createBarStyle(bar2Height, 1)]} />
      <Animated.View style={[createBarStyle(bar3Height, 2)]} />
      <Animated.View style={[createBarStyle(bar4Height, 3)]} />
      <Animated.View style={[createBarStyle(bar5Height, 4)]} />
    </Animated.View>
  );
};

// 下载进度动画组件
const DownloadProgressAnimation: React.FC<{progress: number}> = ({progress}) => {
  // 创建进度动画值
  const progressAnimated = useSharedValue(0);
  
  // 更新进度动画
  React.useEffect(() => {
    progressAnimated.value = withTiming(progress, {duration: 300, easing: Easing.ease});
  }, [progress]);

  // 创建进度条的动画样式
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimated.value}%`,
      height: '100%',
      backgroundColor: '#4ECDC4',
      borderRadius: 2,
    };
  });

  return (
    <View style={styles.downloadProgressContainer}>
      <Animated.View style={[styles.downloadProgressBar, progressBarStyle]} />
    </View>
  );
};

export const PlayButton: React.FC<PlayButtonProps> = ({
  navOpacity,
  navTranslateYBottom,
  handlePlayPause,
  isPlaying,
  downloadingItems,
  downloadProgress,
  questionId,
}) => {
  const [bottomInset, setBottomInset] = React.useState(0);
  const safeAreaRef = React.useRef<View>(null);
  // 按钮按下状态动画
  const scale = useSharedValue(1);
  // 拖动位置共享值
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

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

  // 创建动画样式 - 播放中时不随导航消失且可拖动
  const animatedStyle = useAnimatedStyle(() => {
    // 当正在播放时，保持按钮可见，不应用导航消失效果，并应用拖动位置
    if (isPlaying) {
      return {
        opacity: 1,
        transform: [
          {translateX: positionX.value + offsetX.value},
          {translateY: positionY.value + offsetY.value},
          {scale: scale.value}
        ],
        display: 'flex',
      };
    }
    
    // 未播放时应用导航动画效果，重置拖动位置
    offsetX.value = 0;
    offsetY.value = 0;
    positionX.value = 0;
    positionY.value = 0;
    
    return {
      opacity: navOpacity.value,
      transform: [
        {translateY: navTranslateYBottom.value},
        {scale: scale.value}
      ],
      // 当透明度接近0时完全隐藏容器
      display: navOpacity.value > 0.02 ? 'flex' : 'none',
    };
  });

  // 动态计算PlayButton的位置，考虑底部导航栏高度和安全区域
  const playButtonStyle = {
    ...styles.playButtonContainer,
    bottom: 60 + bottomInset, // 底部导航栏高度(60) + 底部安全区域高度
  };

  // 处理按钮按下和抬起事件
  const handlePressIn = () => {
    scale.value = withTiming(0.9, {duration: 100});
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {duration: 100});
  };

  // 处理拖动手势
  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {offsetX: number; offsetY: number}
  >({
    onStart: (_, ctx) => {
      ctx.offsetX = offsetX.value;
      ctx.offsetY = offsetY.value;
    },
    onActive: (event, ctx) => {
      if (isPlaying) {
        offsetX.value = ctx.offsetX + event.translationX;
        offsetY.value = ctx.offsetY + event.translationY;
      }
    },
    onEnd: () => {
      if (isPlaying) {
        // 保存最终位置
        positionX.value += offsetX.value;
        positionY.value += offsetY.value;
        offsetX.value = 0;
        offsetY.value = 0;
      }
    },
  });

  // 根据平台调整按钮样式
  const platformButtonStyle = Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  } : {
    elevation: 8,
  };

  // 检查当前是否正在下载此题目的音频
  const isDownloading = downloadingItems.has(questionId);
  const currentProgress = downloadProgress[questionId] || 0;

  return (
    <>
      {/* 隐藏的SafeAreaView用于获取安全区域尺寸 */}
      <SafeAreaView
        ref={safeAreaRef}
        style={{position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0}}
        onLayout={handleSafeAreaLayout}
      />
      <Animated.View style={[playButtonStyle, animatedStyle]}>
        <PanGestureHandler
          enabled={isPlaying}
          onGestureEvent={gestureHandler}
        >
          <Animated.View>
            <TouchableOpacity 
              style={[
                styles.playButton, 
                platformButtonStyle, 
                isPlaying && styles.playingButton,
                isDownloading && styles.downloadingButton
              ]} 
              onPress={handlePlayPause}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              {isDownloading ? (
                // 下载中状态 - 显示进度指示器和ActivityIndicator
                <View style={styles.downloadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <View style={styles.downloadProgressWrapper}>
                    <DownloadProgressAnimation progress={currentProgress} />
                    <Text style={styles.downloadProgressText}>{Math.round(currentProgress)}%</Text>
                  </View>
                </View>
              ) : isPlaying ? (
                // 播放时显示波形动画
                <AudioWaveform isPlaying={isPlaying} />
              ) : (
                // 未播放时显示文字
                <Text style={styles.playButtonText}>听</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </>
  );
};
