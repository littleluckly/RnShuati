'use client';

import {useNavigation} from '@react-navigation/native';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import LinearGradient from 'react-native-linear-gradient';
// import {Icon} from 'react-native-paper';
import Icon from '@react-native-vector-icons/material-design-icons';
import {routeNameMap} from '@/navigation/constant';
import {HomeStackNavigation} from '@/navigation/Types';
import {QuestionMeta} from '@/models/QuestionMeta';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import WaveformAnimation from '@/components/WaveformAnimation';

interface Props {
  metadata: QuestionMeta;
  onWillOpen: (id: string) => void;
  setRef: (ref: any) => void;
  index?: number; // 添加索引参数
}

const SwipeableItem = forwardRef((props: Props, _) => {
  const {id, question_markdown} = props.metadata;
  const {onWillOpen, setRef, index = 0} = props;
  const navigation = useNavigation<HomeStackNavigation>();
  const swipeRef = React.useRef<any>();

  // 音频播放状态
  const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
    currentItemId: null,
    state: 'idle',
    currentAudioIndex: 0,
    totalAudios: 0,
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

  // 处理列表项点击导航
  const handleNavigateToDetail = () => {
    // 在导航之前停止当前播放的音频
    AudioManager.stopCurrent();

    // 导航到详情页，传递当前项的索引
    navigation.navigate(routeNameMap.detailScreen, {
      id,
      currentIndex: index, // 传递当前项的索引
    });
  };
  return (
    <View style={styles.container}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={RightActions}
        onSwipeableWillOpen={() => onWillOpen(id)}
        friction={2}
        rightThreshold={20}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.8}
          onPress={handleNavigateToDetail}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            {isCurrentlyPlaying ? (
              <View style={styles.playingContainer}>
                <WaveformAnimation isPlaying={true} size={48} color="#4ECDC4" />
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
            style={{backgroundColor: '#ffe8c7', padding: 8, borderRadius: 24}}>
            <Icon name="lock" color="#ffb933" size={28}></Icon>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
});

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
