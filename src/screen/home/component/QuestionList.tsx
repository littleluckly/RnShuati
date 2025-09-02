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
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {Question} from '@/services/apiTypes';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import {useNavigation} from '@react-navigation/native';
import {HomeStackNavigation} from '@/navigation/Types';
import {routeNameMap} from '@/navigation/constant';
import {useQuestionContext} from '@/contexts/QuestionContext';

interface Props {
  subjectId: string;
  filters?: {difficulty?: string; tags?: string[]};
}

// 屏幕尺寸
const {width} = Dimensions.get('window');

const OptimizedFlatList: React.FC<Props> = ({
  subjectId,
  filters = {},
}: Props) => {
  const {state, refreshData, loadMore, dispatch} = useQuestionContext();
  const {questions, pagination, loading, refreshing, hasMore} = state;
  // const {onWillOpen, setRef, index = 0, selectedItemId, onItemPress} = props;
  const navigation = useNavigation<HomeStackNavigation>();

  // 列表引用
  const flatListRef = useRef<FlatList<Question> | null>(null);

  // 监听subjectId和filters变化，更新Context中的状态
  useEffect(() => {
    if (subjectId) {
      dispatch({type: 'SET_SUBJECT_ID', payload: subjectId});
      if (filters) {
        dispatch({type: 'SET_FILTERS', payload: filters});
      }
    }
  }, [subjectId, filters, dispatch]);

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
      navigation.navigate(routeNameMap.detailScreen, {
        id,
        currentIndex: index,
      });
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
      const {files: audioFiles, id} = question;
      // console.log('Audio files available:', audioFiles);
      // 开始播放序列：题目 → 精简答案 → 详细解析
      AudioManager.addListener(id, setPlaybackInfo);
      AudioManager.startPlayback(id, {
        audio_question: audioFiles.audio_question,
        audio_simple: audioFiles.audio_simple,
        audio_analysis: audioFiles.audio_analysis,
      });
      setPlaybackId(playbackId === id ? '' : id);
    },
    [playbackId],
  );

  // 监听音频播放状态变化
  useEffect(() => {
    // 这里可以添加音频播放状态的监听逻辑
    // 例如，当音频播放状态变化时更新isCurrentlyPlaying和hasAnyPlayback
  }, [playbackInfo.state, playbackInfo.currentItemId]);
  // 渲染列表项
  const renderItem = useCallback(
    ({item, index}: {item: Question; index: number}) => (
      <TouchableOpacity
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
          <Text>
            {playbackInfo.state}-
            {JSON.stringify(playbackInfo.currentItemId === item.id)}
          </Text>
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
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>No more data</Text>
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
});

export default OptimizedFlatList;
