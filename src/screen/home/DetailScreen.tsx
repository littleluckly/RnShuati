import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  BackHandler,
  Text,
  FlatList,
  ScrollView,
  Alert, // 导入 Alert 组件
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {HomeStackParamList, HomeStackNavigation} from '@/navigation/Types';
import {routeNameMap} from '@/navigation/constant';
import {useQuestionContext} from '@/contexts/QuestionContext';
import MarkdownWithHighlight from '@/component/markdown-hightlight/MarkdownWithHighlight';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import Icon from 'react-native-vector-icons/MaterialIcons';
import he from 'he'; // 导入 he 库来解析 HTML 实体字符
import OnboardingOverlay from '@/components/OnboardingOverlay'; // 导入新手引导组件
import {
  shouldShowOnboarding,
  markOnboardingCompleted,
  setSkipOnboarding,
} from '@/utils/onboardingUtils'; // 导入新手引导工具

const {width, height} = Dimensions.get('window');

type DetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  typeof routeNameMap.detailScreen
>;

export default function DetailScreen() {
  const navigation = useNavigation<HomeStackNavigation>();
  const route = useRoute<DetailScreenRouteProp>();
  const {state, loadMore} = useQuestionContext();

  // 安全地解构 route.params，处理可能为 undefined 的情况
  const params = route.params || {id: '', currentIndex: 0};
  const {id, currentIndex = 0, sourceLayout} = params;

  // 获取当前问题数据
  const currentQuestion = state.questions.find(q => q._id === id);

  // 控制导航栏显示状态
  const [showNav, setShowNav] = useState(true);
  const [navOpacity] = useState(new Animated.Value(1));
  const [navTranslateYTop] = useState(new Animated.Value(0)); // 顶部导航栏初始位置在屏幕上方
  const [navTranslateYBottom] = useState(new Animated.Value(0)); // 底部导航栏初始位置在屏幕下方

  // 新手引导状态
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 添加滚动偏移量跟踪
  const scrollOffset = useRef(0);
  const scrollOffsetThreshold = 10; // 滚动偏移量阈值

  // 控制目录抽屉显示状态
  const [showDirectory, setShowDirectory] = useState(false);
  const [directoryTranslateX] = useState(new Animated.Value(-width * 0.8));

  // 音频播放状态
  const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
    currentItemId: null,
    state: 'idle',
    currentAudioIndex: 0,
    totalAudios: 0,
  });

  // 引用组件
  const contentScrollViewRef = useRef<ScrollView>(null);
  const directoryFlatListRef = useRef<FlatList>(null);

  // 检查是否需要显示新手引导
  useEffect(() => {
    const checkOnboarding = async () => {
      const shouldShow = await shouldShowOnboarding();
      setShowOnboarding(shouldShow);
    };

    checkOnboarding();
  }, []);

  // 导航栏动画
  const animateNav = useCallback(
    (show: boolean) => {
      Animated.parallel([
        Animated.timing(navOpacity, {
          toValue: show ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(navTranslateYTop, {
          toValue: show ? 0 : -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(navTranslateYBottom, {
          toValue: show ? 0 : 60,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setShowNav(show);
    },
    [navOpacity, navTranslateYTop, navTranslateYBottom],
  );

  // 目录抽屉动画
  const animateDirectory = useCallback(
    (show: boolean) => {
      Animated.timing(directoryTranslateX, {
        toValue: show ? 0 : -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setShowDirectory(show);
    },
    [directoryTranslateX],
  );

  // 切换导航栏显示
  const toggleNav = useCallback(() => {
    animateNav(!showNav);
  }, [showNav, animateNav]);

  // 处理返回
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 处理上一题
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevQuestion = state.questions[prevIndex];
      if (prevQuestion) {
        // 停止当前音频播放
        AudioManager.stopCurrent();
        // 重置内容区域滚动位置
        contentScrollViewRef.current?.scrollTo({y: 0, animated: true});
        navigation.navigate(routeNameMap.detailScreen, {
          id: prevQuestion._id,
          currentIndex: prevIndex,
        });
      }
    }
  }, [currentIndex, navigation, state.questions]);

  // 处理下一题
  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < state.questions.length) {
      const nextQuestion = state.questions[nextIndex];
      if (nextQuestion) {
        // 停止当前音频播放
        AudioManager.stopCurrent();
        // 重置内容区域滚动位置
        contentScrollViewRef.current?.scrollTo({y: 0, animated: true});
        navigation.navigate(routeNameMap.detailScreen, {
          id: nextQuestion._id,
          currentIndex: nextIndex,
        });
      }
    }
  }, [currentIndex, navigation, state.questions]);

  // 处理目录导航
  const handleDirectory = useCallback(() => {
    // 切换目录抽屉显示
    animateDirectory(!showDirectory);
  }, [showDirectory, animateDirectory]);

  // 处理目录项点击
  const handleDirectoryItemPress = useCallback(
    (questionId: string, index: number) => {
      // 停止当前音频播放
      AudioManager.stopCurrent();
      // 关闭目录抽屉
      animateDirectory(false);
      // 重置内容区域滚动位置
      contentScrollViewRef.current?.scrollTo({y: 0, animated: true});
      // 导航到选中的题目
      navigation.navigate(routeNameMap.detailScreen, {
        id: questionId,
        currentIndex: index,
      });
    },
    [navigation, animateDirectory],
  );

  // 处理播放/暂停
  const handlePlayPause = useCallback(() => {
    if (!currentQuestion) return;

    const {files: audioFiles, _id: questionId} = currentQuestion;

    // 如果当前正在播放此题目，则暂停/恢复
    if (playbackInfo.currentItemId === questionId) {
      if (playbackInfo.state === 'playing') {
        AudioManager.pauseCurrent();
      } else if (playbackInfo.state === 'paused') {
        AudioManager.resumeCurrent();
      }
    }
    // 如果没有播放任何内容或播放的是其他题目，则开始播放
    else {
      AudioManager.addListener('detailScreen', setPlaybackInfo);
      AudioManager.startPlayback(questionId, {
        audio_question: audioFiles.audio_question,
        audio_simple: audioFiles.audio_answer_simple,
        audio_analysis: audioFiles.audio_answer_analysis,
      });
    }
  }, [currentQuestion, playbackInfo]);

  // 处理设置
  const handleSettings = useCallback(() => {
    // 显示一个简单的设置选项对话框
    Alert.alert(
      '设置',
      '请选择操作',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '关闭新手引导',
          onPress: async () => {
            await setSkipOnboarding(true);
            setShowOnboarding(false);
          },
        },
      ],
      {cancelable: true},
    );
  }, []);

  // 处理新手引导完成
  const handleOnboardingComplete = useCallback(async () => {
    await markOnboardingCompleted();
    setShowOnboarding(false);
  }, []);

  // 处理新手引导跳过
  const handleOnboardingSkip = useCallback(async () => {
    await setSkipOnboarding(true);
    setShowOnboarding(false);
  }, []);

  // 处理目录列表滚动到底部加载更多
  const handleDirectoryEndReached = useCallback(() => {
    if (state.pagination.hasNext) {
      loadMore();
    }
  }, [state.pagination.hasNext, loadMore]);

  // 渲染目录底部加载指示器
  const renderDirectoryFooter = useCallback(() => {
    if (state.loading) {
      return (
        <View style={styles.directoryLoadingFooter}>
          <Text style={styles.directoryLoadingText}>加载中...</Text>
        </View>
      );
    }
    return null;
  }, [state.loading]);

  // 处理滚动事件
  const handleScroll = useCallback(
    (event: any) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const delta = currentOffset - scrollOffset.current;

      // 只有当滚动偏移量超过阈值时才隐藏导航栏
      if (Math.abs(delta) > scrollOffsetThreshold) {
        // 无论向上还是向下滚动，都隐藏导航栏
        if (showNav) {
          animateNav(false);
        }

        // 更新滚动偏移量
        scrollOffset.current = currentOffset;
      }
    },
    [showNav, animateNav],
  );

  // 处理硬件返回键
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showDirectory) {
          animateDirectory(false);
          return true;
        }
        if (showNav) {
          animateNav(false);
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [showNav, showDirectory, animateNav, animateDirectory]);

  // 状态栏和导航设置
  useEffect(() => {
    // 设置状态栏样式
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#ffffff');

    // 隐藏底部标签栏
    navigation.getParent()?.setOptions({
      tabBarStyle: {display: 'none'},
    });

    return () => {
      // 组件卸载时恢复状态栏设置
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#f5f7fa');
      // 恢复底部标签栏
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'flex'},
      });
      // 组件卸载时停止音频播放
      AudioManager.stopCurrent();
    };
  }, [navigation]);

  // 更新播放状态
  useEffect(() => {
    if (currentQuestion) {
      const listenerId = 'detailScreen';
      AudioManager.addListener(listenerId, setPlaybackInfo);

      return () => {
        AudioManager.removeListener(listenerId);
      };
    }
  }, [currentQuestion]);

  // 检查剩余题目数量，当少于5题时触发加载更多
  useEffect(() => {
    // 只有当还有更多题目可以加载时才检查
    if (state.pagination.hasNext && !state.loading) {
      // 计算剩余题目数量：当前已加载的题目数量 - 当前索引
      const remainingQuestions = state.questions.length - (currentIndex + 1);

      // 如果剩余题目数量少于5题，触发加载更多
      if (remainingQuestions < 5) {
        loadMore();
      }
    }
  }, [
    currentIndex,
    state.questions.length,
    state.pagination.hasNext,
    state.loading,
    loadMore,
  ]);

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.navTop,
            {opacity: navOpacity, transform: [{translateY: navTranslateYTop}]},
          ]}>
          <TouchableOpacity style={styles.navButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.content}>
          <Text style={styles.notFoundText}>题目未找到</Text>
        </View>
      </View>
    );
  }

  // 渲染目录项
  const renderDirectoryItem = useCallback(
    ({item, index}: {item: any; index: number}) => (
      <TouchableOpacity
        style={[
          styles.directoryItem,
          id === item._id && styles.directoryItemActive,
        ]}
        onPress={() => handleDirectoryItemPress(item._id, index)}>
        <Text
          style={[
            styles.directoryItemText,
            id === item._id && styles.directoryItemTextActive,
          ]}
          numberOfLines={2}>
          {item.question_markdown.replace(/[#*`]/g, '')}
        </Text>
        {id === item._id && (
          <Icon
            name="check"
            size={16}
            color="#1da1f2"
            style={styles.directoryItemCheck}
          />
        )}
      </TouchableOpacity>
    ),
    [id, handleDirectoryItemPress],
  );

  // 解析 HTML 实体字符
  const decodedQuestion = he.decode(currentQuestion.question_markdown);
  const decodedSimpleAnswer = he.decode(currentQuestion.answer_simple_markdown);
  const decodedDetailAnswer = he.decode(
    currentQuestion.answer_detail_markdown || '暂无扩展答案',
  );
  const decodedAnalysisAnswer = he.decode(
    currentQuestion.answer_analysis_markdown,
  );

  return (
    <View style={styles.container}>
      {/* 目录抽屉 */}
      <Animated.View
        style={[
          styles.directoryContainer,
          {transform: [{translateX: directoryTranslateX}]},
        ]}>
        <View style={styles.directoryHeader}>
          <Text style={styles.directoryTitle}>题目目录</Text>
          <TouchableOpacity
            style={styles.directoryCloseButton}
            onPress={() => animateDirectory(false)}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
          ref={directoryFlatListRef}
          data={state.questions}
          renderItem={renderDirectoryItem}
          keyExtractor={item => item._id}
          style={styles.directoryList}
          showsVerticalScrollIndicator={true}
          onEndReached={handleDirectoryEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderDirectoryFooter}
        />
      </Animated.View>

      {/* 遮罩层 - 当目录打开时显示 */}
      {showDirectory && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => animateDirectory(false)}
        />
      )}

      {/* 顶部导航栏 */}
      <Animated.View
        style={[
          styles.navTop,
          {opacity: navOpacity, transform: [{translateY: navTranslateYTop}]},
        ]}>
        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {currentIndex + 1}/{state.pagination.total}
        </Text>
      </Animated.View>

      {/* 内容区域 - 全屏展示 */}
      <ScrollView
        ref={contentScrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16} // 优化滚动事件触发频率
      >
        <TouchableOpacity activeOpacity={1} onPress={toggleNav}>
          {/* 题目标题 - 更加突出显示 */}
          <Text style={styles.questionTitle}>{decodedQuestion}</Text>

          {/* 精简答案 */}
          <Text style={styles.sectionTitle}>精简答案</Text>
          <MarkdownWithHighlight content={decodedSimpleAnswer} />

          {/* 扩展答案 */}
          <Text style={styles.sectionTitle}>扩展答案</Text>
          <MarkdownWithHighlight content={decodedDetailAnswer} />

          {/* 详细解析 */}
          <Text style={styles.sectionTitle}>详细解析</Text>
          <MarkdownWithHighlight content={decodedAnalysisAnswer} />
        </TouchableOpacity>
      </ScrollView>

      {/* 底部导航栏 */}
      <Animated.View
        style={[
          styles.navBottom,
          {opacity: navOpacity, transform: [{translateY: navTranslateYBottom}]},
        ]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrev}
          disabled={currentIndex === 0}>
          <View style={styles.navButtonContainer}>
            <Icon
              name="arrow-back"
              size={24}
              color={currentIndex === 0 ? '#ccc' : '#000'}
            />
            <Text
              style={[
                styles.navButtonText,
                {color: currentIndex === 0 ? '#ccc' : '#000'},
              ]}>
              上一题
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
          disabled={currentIndex === state.questions.length - 1}>
          <View style={styles.navButtonContainer}>
            <Icon
              name="arrow-forward"
              size={24}
              color={
                currentIndex === state.questions.length - 1 ? '#ccc' : '#000'
              }
            />
            <Text
              style={[
                styles.navButtonText,
                {
                  color:
                    currentIndex === state.questions.length - 1
                      ? '#ccc'
                      : '#000',
                },
              ]}>
              下一题
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleDirectory}>
          <View style={styles.navButtonContainer}>
            <Icon name="list" size={24} color="#000" />
            <Text style={[styles.navButtonText, {color: '#000'}]}>目录</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleSettings}>
          <View style={styles.navButtonContainer}>
            <Icon name="settings" size={24} color="#000" />
            <Text style={[styles.navButtonText, {color: '#000'}]}>设置</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 播放按钮 - 紧挨着底部导航的右上侧 */}
      <Animated.View
        style={[
          styles.playButtonContainer,
          {opacity: navOpacity, transform: [{translateY: navTranslateYBottom}]},
        ]}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Text style={styles.playButtonText}>
            {playbackInfo.currentItemId === currentQuestion._id &&
            playbackInfo.state === 'playing'
              ? '停'
              : '听'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 新手引导覆盖层 */}
      {showOnboarding && (
        <OnboardingOverlay
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60, // 为顶部导航栏留出空间
    paddingBottom: 60, // 为底部导航栏留出空间
  },
  // 题目标题样式 - 更加突出
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  // 分块标题样式
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1da1f2',
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff', // 与内容区背景一致
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 1, // 添加底部边框
    borderBottomColor: '#e0e0e0', // 浅色边框
  },
  navBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  navTitle: {
    color: '#000', // 改为黑色以匹配白色背景
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  // 播放按钮样式
  playButtonContainer: {
    position: 'absolute',
    bottom: 70, // 紧挨着底部导航的右上侧
    right: 20,
    zIndex: 101,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1da1f2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // 目录抽屉样式
  directoryContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 200,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directoryHeader: {
    height: 60,
    backgroundColor: '#1da1f2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  directoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  directoryCloseButton: {
    padding: 8,
  },
  directoryList: {
    flex: 1,
  },
  directoryItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  directoryItemActive: {
    backgroundColor: 'rgba(29, 161, 242, 0.1)',
  },
  directoryItemText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  directoryItemTextActive: {
    color: '#1da1f2',
    fontWeight: '500',
  },
  directoryItemCheck: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  directoryLoadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
  directoryLoadingText: {
    color: '#666',
    fontSize: 14,
  },
  // 遮罩层
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 150,
  },
});
