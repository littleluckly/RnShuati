'use client';

import {useNavigation} from '@react-navigation/native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// import {Icon} from 'react-native-paper';
import {useSharedTransition} from '@/contexts/sharedTransitionContext';
import {QuestionMeta} from '@/models/QuestionMeta';
import {routeNameMap} from '@/navigation/constant';
import {HomeStackNavigation} from '@/navigation/Types';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import Icon from '@react-native-vector-icons/material-design-icons';

interface Props {
  metadata: QuestionMeta;
  onWillOpen: (id: string) => void;
  setRef: (ref: any) => void;
  index?: number; // 添加索引参数
  selectedItemId?: string | null; // 当前被选中的列表项ID
  onItemPress?: (itemId: string) => void; // 列表项点击回调
}

const SwipeableItem = React.memo(
  forwardRef((props: Props, _) => {
    const {id, question_markdown} = props.metadata;
    const {onWillOpen, setRef, index = 0, selectedItemId, onItemPress} = props;
    const navigation = useNavigation<HomeStackNavigation>();
    const swipeRef = React.useRef<any>();
    const itemRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

    // 动画值初始化
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    // 音频播放状态
    const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
      currentItemId: null,
      state: 'idle',
      currentAudioIndex: 0,
      totalAudios: 0,
    });

    // 判断是否应该隐藏（当有选中项且不是自己时）
    const shouldHide = selectedItemId && selectedItemId !== id;

    // 动画效果管理
    useEffect(() => {
      if (shouldHide) {
        // 隐藏动画：透明度降低、缩放、上移
        opacity.value = withTiming(0.3, {duration: 250});
        scale.value = withTiming(0.95, {duration: 250});
        translateY.value = withTiming(-10, {duration: 250});
      } else {
        // 显示动画：恢复原状
        opacity.value = withSpring(1, {damping: 20, stiffness: 300});
        scale.value = withSpring(1, {damping: 20, stiffness: 300});
        translateY.value = withSpring(0, {damping: 20, stiffness: 300});
      }
    }, [shouldHide, opacity, scale, translateY]);

    // 动画样式
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{scale: scale.value}, {translateY: translateY.value}],
      };
    });

    // 当前项是否正在播放
    const isCurrentlyPlaying =
      playbackInfo.currentItemId === id && playbackInfo.state === 'playing';
    const isCurrentlyPaused =
      playbackInfo.currentItemId === id && playbackInfo.state === 'paused';
    const hasAnyPlayback = isCurrentlyPlaying || isCurrentlyPaused;

    // 把内部 swipeRef 抛给父组件
    useImperativeHandle(_, () => swipeRef.current);
    React.useEffect(() => {
      setRef(swipeRef.current);
    }, [setRef]);

    // 监听音频播放状态变化
    useEffect(() => {
      const handlePlaybackUpdate = (info: AudioPlaybackInfo) => {
        setPlaybackInfo(info);
      };

      AudioManager.addListener(id, handlePlaybackUpdate);

      // 初始化状态
      setPlaybackInfo(AudioManager.getCurrentPlaybackInfo());

      return () => {
        AudioManager.removeListener(id);
      };
    }, [id]);

    /* 右侧按钮 - 美化版本 */
    const RightActions = () => {
      const buttons = [
        {
          label: '收藏',
          icon: '♥',
          gradientColors: ['#FF6B6B', '#FF8E8E'],
          shadowColor: '#FF6B6B',
        },
        {
          label: '编辑',
          icon: '✎',
          gradientColors: ['#4ECDC4', '#44A08D'],
          shadowColor: '#4ECDC4',
        },
        {
          label: '删除',
          icon: '✕',
          gradientColors: ['#FF6B6B', '#FF4757'],
          shadowColor: '#FF6B6B',
        },
      ];

      return (
        <View style={styles.rightActions}>
          {buttons.map((button, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionContainer,
                idx === buttons.length - 1 && styles.lastAction,
              ]}
              onPress={() => console.log(`${button.label} ${id}`)}>
              <LinearGradient
                colors={button.gradientColors}
                style={[
                  styles.action,
                  {
                    shadowColor: button.shadowColor,
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  },
                  idx === buttons.length - 1 && {
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                  },
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>{button.icon}</Text>
                  <Text style={styles.actionText}>{button.label}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      );
    };

    // 处理播放/暂停点击
    const handlePlayPause = () => {
      const audioFiles = props.metadata.getAudioFiles();

      console.log('Audio files available:', audioFiles);

      // 开始播放序列：题目 → 精简答案 → 详细解析
      AudioManager.startPlayback(id, {
        audio_question: audioFiles.audio_question,
        audio_simple: audioFiles.audio_simple,
        audio_analysis: audioFiles.audio_analysis,
      });
    };

    const {dispatch} = useSharedTransition();
    const handleNavigateToDetail = React.useCallback(() => {
      // 触发隐藏动画
      if (onItemPress) {
        onItemPress(id);
      }

      // 立即停止音频以提供即时反馈
      AudioManager.stopCurrent();
      dispatch({type: 'START'});

      // 缩短延迟时间，在动画开始后就立即跳转
      // 这样可以避免用户看到状态重置的闪烁
      setTimeout(() => {
        // 测量当前列表项的布局信息
        if (itemRef.current) {
          itemRef.current.measure(
            (
              x: number,
              y: number,
              width: number,
              height: number,
              pageX: number,
              pageY: number,
            ) => {
              // 验证测量值有效性
              if (
                isNaN(pageX) ||
                isNaN(pageY) ||
                isNaN(width) ||
                isNaN(height)
              ) {
                console.warn('❌ 测量值包含 NaN，使用备用导航方式');
                // 备用导航方式
                navigation.navigate(routeNameMap.detailScreen, {
                  id,
                  currentIndex: index,
                });
                return;
              }

              console.log('📏 列表项布局测量:', {
                pageX,
                pageY,
                width,
                height,
                itemId: id,
                screenDimensions: {screenWidth: width, screenHeight: height},
              });

              // 🚀 性能优化：使用 requestAnimationFrame + InteractionManager 双重优化
              requestAnimationFrame(() => {
                InteractionManager.runAfterInteractions(() => {
                  // 导航到详情页，传递当前项的索引和布局信息
                  navigation.navigate(routeNameMap.detailScreen, {
                    id,
                    currentIndex: index,
                    sourceLayout: {
                      x: pageX,
                      y: pageY,
                      width,
                      height,
                    },
                  });
                });
              });
            },
          );
        } else {
          console.warn('❌ itemRef.current 为空，使用备用导航方式');
          // 备用导航方式
          navigation.navigate(routeNameMap.detailScreen, {
            id,
            currentIndex: index,
          });
        }
      }, 100); // 缩短延迟到100ms，减少状态重置的可见性
    }, [navigation, id, index, onItemPress]);
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Swipeable
          ref={swipeRef}
          renderRightActions={RightActions}
          onSwipeableWillOpen={() => onWillOpen(id)}
          friction={2}
          rightThreshold={20}>
          <TouchableOpacity
            ref={itemRef}
            style={styles.row}
            activeOpacity={0.8}
            onPress={handleNavigateToDetail}>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButton}>
              {isCurrentlyPlaying ? (
                <View style={styles.playingContainer}>
                  <View style={styles.playingOverlay}>
                    <Icon name="pause-circle" color="#4ECDC4" size={48} />
                  </View>
                </View>
              ) : (
                <Icon
                  name="play-circle"
                  color={hasAnyPlayback ? '#4ECDC4' : '#d2d2d2'}
                  size={48}
                />
              )}
              {/* 显示播放进度指示器 */}
              {hasAnyPlayback && (
                <View style={styles.progressIndicator}>
                  <Text style={styles.progressText}>
                    {playbackInfo.currentAudioIndex + 1}/
                    {playbackInfo.totalAudios}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.textBox}>
              <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
                {question_markdown}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#ffe8c7',
                padding: 8,
                borderRadius: 24,
              }}>
              <Icon name="lock" color="#ffb933" size={28}></Icon>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  }),
  (prevProps: Props, nextProps: Props) => {
    // 🚀 性能优化：防止不必要的重新渲染
    return (
      prevProps.metadata.id === nextProps.metadata.id &&
      prevProps.index === nextProps.index &&
      prevProps.selectedItemId === nextProps.selectedItemId
    );
  },
);

/* 美化后的样式 */
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginHorizontal: 12,
    elevation: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  textBox: {flex: 1, marginHorizontal: 12},
  title: {
    fontSize: 14,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  // 播放按钮相关样式
  playButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },
  playingContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  playingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    width: 48,
    height: 48,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: '100%',
  },
  actionContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  lastAction: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  actionContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default SwipeableItem;
