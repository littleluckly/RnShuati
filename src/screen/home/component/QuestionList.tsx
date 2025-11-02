import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@react-native-vector-icons/material-design-icons';
import {Question} from '@/services/apiTypes';
import {audioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import {useNavigation} from '@react-navigation/native';
import {HomeStackNavigation} from '@/navigation/Types';
import {routeNameMap} from '@/navigation/constant';
import {useQuestionContext} from '@/contexts/QuestionContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {State} from 'react-native-track-player';
import loopAudioManager, {LoopMode} from '@/services/LoopAudioManager';
import {questionApiService} from '@/services'; // 添加这行导入语句
import RNFS from 'react-native-fs'; // 添加这行导入语句
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions'; // 导入权限相关函数
//import {useEffect, useRef, useState, useCallback} from 'react';

// 手动定义 POST_NOTIFICATIONS
const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS';

interface Props {
  subjectId: string;
  filters?: {difficulty?: string | string[]; tags?: string[]};
}

// 屏幕尺寸
const {width} = Dimensions.get('window');
const LIST_ITEM_HEIGHT = 80;

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
  const flatListRef = useRef<FlashList<Question> | null>(null);
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
  // 音频播放相关状态
  const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
    currentItemId: null,
    previousItemId: null,
    state: State.None,
    currentAudioIndex: 0,
    totalAudios: 0,
  });
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.None);

  const handleLoadMore = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  const handleNavigateToDetail = useCallback(
    (id: string, index: number) => {
      // 只有在非列表循环模式下才停止音频
      if (loopMode !== LoopMode.List) {
        audioManager.stopCurrent();
      }

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
    [navigation, loopMode],
  );

  // 组件加载时加载循环模式
  useEffect(() => {
    const loadLoopMode = async () => {
      await loopAudioManager.loadLocalLoopMode();
      setLoopMode(loopAudioManager.loopMode);
    };

    loadLoopMode();
  }, []);

  // 添加下载状态管理
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(
    new Set(),
  );
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});

  // 监听循环模式变化
  useEffect(() => {
    setLoopMode(loopAudioManager.loopMode);
  }, [loopAudioManager.loopMode]);

  // 下载音频文件的函数
  const downloadAudioFile = useCallback(
    async (fileName: string, itemId?: string): Promise<string | null> => {
      try {
        // 调用API服务下载音频文件，传入进度回调
        const response = await questionApiService.downloadAudioFile(
          fileName,
          itemId
            ? progress => {
                // 更新下载进度状态
                setDownloadProgress(prev => ({
                  ...prev,
                  [itemId]: progress,
                }));
              }
            : undefined,
        );

        if (response.success && response.data) {
          return response.data; // 返回本地文件路径
        } else {
          console.error('下载音频文件失败:', response.message);
          return null;
        }
      } catch (error) {
        console.error('下载音频文件时发生错误:', error);
        return null;
      }
    },
    [],
  );

  // 检查今天是否已经提示过通知权限
  const checkIfPromptedToday = async (): Promise<boolean> => {
    try {
      const today = new Date().toDateString(); // 获取今天的日期字符串
      const lastPromptDate = await AsyncStorage.getItem(
        'notification_prompt_date',
      );
      return lastPromptDate === today;
    } catch (error) {
      console.error('检查提示日期时发生错误:', error);
      return false;
    }
  };

  // 保存今天已提示过通知权限
  const savePromptedToday = async (): Promise<void> => {
    try {
      const today = new Date().toDateString(); // 获取今天的日期字符串
      await AsyncStorage.setItem('notification_prompt_date', today);
    } catch (error) {
      console.error('保存提示日期时发生错误:', error);
    }
  };

  // 处理播放/暂停点击
  // 组件挂载时添加统一的音频监听器
  useEffect(() => {
    audioManager.addListener('questionListScreen', setPlaybackInfo);

    return () => {
      audioManager.removeListener('questionListScreen');
    };
  }, []);

  // 注册预加载回调函数到 LoopAudioManager
  useEffect(() => {
    // 定义预加载回调函数
    const preloadCallback = async () => {
      // 只有在有更多数据可加载且不在加载过程中时才执行预加载
      if (pagination.hasNext && !loading) {
        console.log('执行预加载更多题目');
        await loadMore();
      }
    };

    // 注册回调函数
    loopAudioManager.setPreloadCallback(preloadCallback);

    // 清理函数：组件卸载时清除回调函数
    return () => {
      loopAudioManager.clearPreloadCallback();
    };
  }, [pagination.hasNext, loading, loadMore]);

  // 处理播放/暂停点击
  const handlePlayPause = useCallback(
    async (question: Question) => {
      // 检查通知权限但不阻止播放
      let result: string = RESULTS.DENIED;

      // iOS：无需请求权限即可显示播放控件
      // Android 13 也无需请求权限。 对应的 API Level 是 33。
      if (
        Platform.OS === 'ios' ||
        (Platform.OS === 'android' && Platform.Version < 33)
      ) {
        result = RESULTS.GRANTED;
      } else {
        // 检查当前权限状态
        result = await check(POST_NOTIFICATIONS as Permission);
      }

      // 如果没有权限，检查今天是否已经提示过
      if (result !== RESULTS.GRANTED) {
        const hasPromptedToday = await checkIfPromptedToday();

        // 只有今天没有提示过才显示权限提示
        if (!hasPromptedToday) {
          Alert.alert(
            '开启通知权限',
            '开启通知权限可以在通知栏中切换播放、查看播放信息，获得更好的使用体验',
            [
              {
                text: '今日不再提示',
                style: 'cancel',
                onPress: async () => {
                  // 用户点击"今日不再提示"，保存今天的日期
                  await savePromptedToday();
                },
              },
              {
                text: '去开启',
                onPress: async () => {
                  // 用户点击"去开启"后，调用系统权限授权弹窗
                  const requestResult = await request(
                    POST_NOTIFICATIONS as Permission,
                  );

                  // 如果权限被永久拒绝，提示用户去设置中手动开启
                  if (requestResult === RESULTS.BLOCKED) {
                    Alert.alert(
                      '如果后续需要在通知栏显示播放信息',
                      '请在系统设置中-通知中手动开启通知权限',
                      [{text: '我知道了', style: 'cancel'}],
                    );
                  }
                },
              },
            ],
          );
        }
      }

      const {files: audioFiles, _id} = question;

      // 检查是否正在下载此题目的音频
      if (downloadingItems.has(_id)) {
        console.log('音频正在下载中，请稍候...');
        return;
      }

      // 设置下载状态
      setDownloadingItems(prev => new Set(prev).add(_id));

      try {
        // 下载音频文件
        const [questionAudioPath, simpleAnswerPath, detailAnswerPath] =
          await Promise.all([
            audioFiles.audio_question
              ? downloadAudioFile(audioFiles.audio_question, _id)
              : Promise.resolve(null),
            audioFiles.audio_answer_simple
              ? downloadAudioFile(audioFiles.audio_answer_simple, _id)
              : Promise.resolve(null),
            audioFiles.audio_answer_detail
              ? downloadAudioFile(audioFiles.audio_answer_detail, _id)
              : Promise.resolve(null),
          ]);

        // 清除下载状态
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(_id);
          return newSet;
        });

        // 开始播放序列：题目 → 简单答案 → 扩展答案
        // 使用专门的列表项播放方法，确保点击其他项时能正确切换播放
        audioManager.handleListItemPlay(
          _id,
          {
            audio_question: questionAudioPath || undefined,
            audio_answer_simple: simpleAnswerPath || undefined,
            audio_answer_detail: detailAnswerPath || undefined,
          },
          question.question_markdown, // 传入问题文本作为音频名称
        );
      } catch (error) {
        // 清除下载状态
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(_id);
          return newSet;
        });

        console.error('处理音频播放时发生错误:', error);
      }
    },
    [
      loopMode,
      downloadingItems,
      downloadAudioFile,
      checkIfPromptedToday,
      savePromptedToday,
    ],
  );

  // 在列表循环模式下，当音频播放结束时，自动播放下一个题目
  useEffect(() => {
    if (playbackInfo.state === State.Ended && loopMode === LoopMode.List) {
      // 列表循环模式，播放下一个音频
      loopAudioManager.playNext(state.questions, playbackInfo);
    }
  }, [
    playbackInfo.state,
    loopMode,
    playbackInfo.previousItemId,
    state.questions,
  ]);
  // 渲染列表项 - FlashList需要固定高度
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
          {downloadingItems.has(item._id) ? (
            // 下载中状态 - 显示进度指示器
            <View style={styles.playingContainer}>
              <View style={styles.playingOverlay}>
                <ActivityIndicator size="large" color="#4ECDC4" />
              </View>
              {downloadProgress[item._id] !== undefined && (
                <View style={styles.progressIndicator}>
                  <Text style={styles.progressText}>
                    {Math.round(downloadProgress[item._id])}%
                  </Text>
                </View>
              )}
            </View>
          ) : playbackInfo.currentItemId === item._id &&
            playbackInfo.state === State.Playing ? (
            // 播放中状态
            <View style={styles.playingContainer}>
              <View style={styles.playingOverlay}>
                <Icon name="pause-circle" color="#4ECDC4" size={48} />
              </View>
            </View>
          ) : (
            // 默认状态 - 显示播放按钮
            <Icon
              name="play-circle"
              color={
                playbackInfo.currentItemId === item._id ? '#4ECDC4' : '#d2d2d2'
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
      </TouchableOpacity>
    ),
    [handleNavigateToDetail, handlePlayPause, playbackInfo, downloadingItems, downloadProgress],
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
        <Text style={styles.footerText}>{' 努力加载中...'}</Text>
      </View>
    );
  }, [pagination.hasNext]);

  // 键提取器 - FlashList会自动优化key管理
  const keyExtractor = useCallback((item: Question) => item._id, []);

  // 初始加载指示器
  if (loading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>{' 正在初始化数据...'}</Text>
      </View>
    );
  }

  // FlashList需要设置容器高度
  return (
    <View style={styles.container}>
      <FlashList
        ref={flatListRef}
        data={questions}
        extraData={[downloadingItems, downloadProgress, playbackInfo]} // FlashList依赖此属性触发重新渲染
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
        // FlashList性能优化配置
        estimatedItemSize={LIST_ITEM_HEIGHT}
        drawDistance={250}
        numColumns={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // FlashList需要设置容器高度
  },
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 6,
    marginBottom: 6,
    height: LIST_ITEM_HEIGHT, // FlashList需要固定高度
    // 跨平台阴影设置
    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
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

// FlashList版本适配说明：
// 1. 固定高度：列表项必须设置固定高度（80px）
// 2. 容器样式：外层需要flex:1容器
// 3. 性能优化：estimatedItemSize提高初始渲染性能
// 4. 内存优化：drawDistance控制预渲染范围
// 5. 状态更新：extraData必须包含所有影响renderItem的状态变量
// 6. 兼容RN 0.75.2：已验证兼容性
// 
// ⚠️ 重要：FlashList会对renderItem进行缓存优化，只有当extraData中的依赖项发生变化时才会重新渲染列表项。
// 如果播放效果不生效，请确保playbackInfo、downloadingItems、downloadProgress等状态变量正确包含在extraData中。
