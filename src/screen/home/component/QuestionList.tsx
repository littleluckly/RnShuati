import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {Question} from '@/services/apiTypes';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import {useNavigation} from '@react-navigation/native';
import {HomeStackNavigation} from '@/navigation/Types';
import {routeNameMap} from '@/navigation/constant';
import {useQuestionContext} from '@/contexts/QuestionContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {State} from 'react-native-track-player';
interface Props {
  subjectId: string;
  filters?: {difficulty?: string | string[]; tags?: string[]};
}

// 屏幕尺寸
const {width} = Dimensions.get('window');

const OptimizedFlatList: React.FC<Props> = ({
  subjectId,
  filters = {},
}: Props) => {
  const {state, refreshData, loadMore, dispatch, updateFilters} =
    useQuestionContext();
  const {questions, pagination, loading, refreshing, hasMore} = state;
  // const {onWillOpen, setRef, index = 0, selectedItemId, onItemPress} = props;
  const navigation = useNavigation<HomeStackNavigation>();

  // 列表引用
  const flatListRef = useRef<FlatList<Question> | null>(null);
  // 用于存储每个列表项的ref
  const itemRefs = useRef<(View | null)[]>([]);

  // 监听subjectId和filters变化，更新Context中的状态
  useEffect(() => {
    if (subjectId) {
      dispatch({type: 'SET_SUBJECT_ID', payload: subjectId});
    }
  }, [subjectId, dispatch]);

  useEffect(() => {
    if (filters) {
      updateFilters(filters);
    }
  }, [filters, updateFilters]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  // 上拉加载更多
  const handleLoadMore = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  const handleNavigateToDetail = React.useCallback(
    (id: string, index: number) => {
      // 立即停止音频以提供即时反馈
      AudioManager.stopCurrent();

      // 获取当前项的ref
      const itemRef = itemRefs.current[index];

      if (itemRef) {
        // 测量当前项的尺寸和位置
        itemRef.measureInWindow((x, y, width, height) => {
          // 传递测量信息到详情页
          navigation.navigate(routeNameMap.detailScreen, {
            id,
            currentIndex: index,
            sourceLayout: {
              x: x || 0,
              y: y || 0,
              width: width || 0,
              height: height || 0,
            },
          });
        });
      } else {
        // 如果没有获取到ref，仍然导航，但不传递坐标信息
        navigation.navigate(routeNameMap.detailScreen, {
          id,
          currentIndex: index,
        });
      }
    },
    [navigation],
  );

  // 音频播放相关状态
  const [playbackId, setPlaybackId] = useState('');
  const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
    currentItemId: null,
    state: 'idle',
    currentAudioIndex: 0,
    totalAudios: 0,
  });

  // 处理播放/暂停点击
  const handlePlayPause = useCallback(
    (question: Question) => {
      // 设置播放队列并播放本地 MP3
      const playLocalSound = async () => {
        try {
          // 播放器已在 App.tsx 中全局初始化，这里直接使用

          // 清空现有队列
          await TrackPlayer.reset();
          console.log('队列已清空');

          // 添加本地音频到队列（跨平台支持）
          let audioUrl: string;

          // 根据平台选择不同的音频源
          if (Platform.OS === 'android') {
            // Android: 使用 raw 资源
            audioUrl = 'rawresource:///raw/qf53a5ea5_audio_answer_simple';
          } else {
            // iOS: 使用本地音频文件
            audioUrl = 'qf53a5ea5_audio_answer_simple.mp3';
          }
          console.log('audioUrl', audioUrl);

          // 添加音频到队列
          await TrackPlayer.add([
            {
              id: '1',
              url: require('./qf53a5ea5_audio_answer_simple.mp3'),
              title: '题目音频',
              artist: '刷题派',
              type: 'common',
            },
          ]);
          console.log('音频已添加到队列');

          // 开始播放
          await TrackPlayer.play();
          console.log('播放命令已发送');

          // 检查播放状态
          const playState = await TrackPlayer.getState();
          const currentTrack = await TrackPlayer.getCurrentTrack();
          console.log('播放状态:', playState, '当前曲目:', currentTrack);

          // 更新播放状态
          setPlaybackInfo(prev => ({
            ...prev,
            currentItemId: question.id,
            state: 'playing',
            currentAudioIndex: 0,
            totalAudios: 1,
          }));
        } catch (error) {
          console.error('播放失败:', error);
          // 更新播放状态为错误
          setPlaybackInfo(prev => ({
            ...prev,
            state: 'error',
          }));
        }
      };
      playLocalSound();
      // const {files: audioFiles, id} = question;
      // // console.log('Audio files available:', audioFiles);
      // // 开始播放序列：题目 → 简单答案 → 详细答案
      // // todo 详细解析内容过长，默认不播放，通过个人喜好设定
      // // 每个音频播放循环次数可以通过个人喜好设定
      // // 如何支持耳机控制上一曲，下一曲
      // AudioManager.addListener(id, setPlaybackInfo);
      // AudioManager.startPlayback(id, {
      //   audio_question: audioFiles.audio_question,
      //   audio_answer_simple: audioFiles.audio_answer_simple,
      //   audio_answer_detail: audioFiles.audio_answer_detail,
      // });
      // setPlaybackId(playbackId === id ? '' : id);
    },
    [playbackId],
  );

  // 定期检查播放状态
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const checkPlaybackState = async () => {
      if (!mounted) return;

      try {
        const state = await TrackPlayer.getState();
        console.log('当前播放状态:', state);

        if (state === State.Playing) {
          setPlaybackInfo(prev => ({...prev, state: 'playing'}));
        } else if (state === State.Paused) {
          setPlaybackInfo(prev => ({...prev, state: 'paused'}));
        } else if (state === State.Stopped || state === State.None) {
          setPlaybackInfo(prev => ({...prev, state: 'idle'}));
        } else if (state === State.Buffering) {
          setPlaybackInfo(prev => ({...prev, state: 'buffering'}));
        }
      } catch (error) {
        console.error('检查播放状态失败:', error);
      }
    };

    interval = setInterval(checkPlaybackState, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // 监听播放完成事件
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(
      'playback-track-changed',
      async data => {
        if (data.nextTrack == null) {
          // 播放完成
          console.log('音频播放完成');
          setPlaybackInfo(prev => ({
            ...prev,
            state: 'idle',
            currentItemId: null,
          }));
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // 组件卸载时清理音频播放器
  useEffect(() => {
    return () => {
      // 组件卸载时停止播放并重置播放器
      const cleanupPlayer = async () => {
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        } catch (error) {
          console.warn('清理音频播放器时出错:', error);
        }
      };
      cleanupPlayer();
    };
  }, []);
  // 渲染列表项
  const renderItem = useCallback(
    ({item, index}: {item: Question; index: number}) => (
      <TouchableOpacity
        ref={el => (itemRefs.current[index] = el)}
        style={styles.row}
        activeOpacity={0.8}
        onPress={() => handleNavigateToDetail(item._id, index)}>
        <TouchableOpacity
          onPress={() => handlePlayPause(item)}
          style={styles.playButton}>
          {playbackInfo.currentItemId === item.id &&
          playbackInfo.state === 'playing' ? (
            <View style={styles.playingContainer}>
              <View style={styles.playingOverlay}>
                <Icon name="pause-circle" color="#4ECDC4" size={48} />
              </View>
            </View>
          ) : (
            <Icon
              name="play-circle"
              color={
                playbackInfo.currentItemId === item.id ? '#4ECDC4' : '#d2d2d2'
              }
              size={48}
            />
          )}
        </TouchableOpacity>
        <View style={styles.textBox}>
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            {item.question_markdown}
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
    ),
    [handleNavigateToDetail, handlePlayPause, playbackId, playbackInfo],
  );

  // 渲染底部加载更多指示器
  const renderFooter = useCallback(() => {
    if (!pagination.hasNext) {
      return (
        <View style={styles.endContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <View style={styles.endContent}>
              <Ionicons name="checkmark-circle" size={18} color="#666" />
              <Text style={styles.endText}>已经没有更多题目了</Text>
            </View>
            <View style={styles.divider} />
          </View>
          <Text style={styles.endSubText}>换个筛选条件试试吧</Text>
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#0066CC" />
        <Text style={styles.footerText}>{' Loading more...'}</Text>
      </View>
    );
  }, [pagination.hasNext]);

  // 键提取器
  const keyExtractor = useCallback((item: Question) => item._id, []);

  // 初始加载指示器
  if (loading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading initial data...</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={questions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4} // 当列表滚动到距离底部50%高度时触发加载更多
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#0066CC"
          title="Refreshing..."
          titleColor="#0066CC"
        />
      }
      // 性能优化配置
      removeClippedSubviews={true} // 移除屏幕外的子视图
      maxToRenderPerBatch={10} // 每批次渲染的项目数
      windowSize={7} // 可视区域上下额外渲染的屏幕数
      initialNumToRender={10} // 初始渲染的项目数
      getItemLayout={(
        data: ArrayLike<Question> | null | undefined,
        index: number,
      ) => ({
        length: 120, // 每个item的高度
        offset: 120 * index,
        index,
      })} // 预先计算item布局，提高性能
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    height: 120, // 固定高度，配合getItemLayout提高性能
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemContent: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  footerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 6,
    marginBottom: 6,
    elevation: 6,
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

  // 新增的底部结束样式
  endContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 8,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
  },
  endContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  endText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  endSubText: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default OptimizedFlatList;
