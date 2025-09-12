import { useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackNavigation } from '@/navigation/Types';
import { routeNameMap } from '@/navigation/constant';
import { useQuestionContext } from '@/contexts/QuestionContext';
import { AudioManager, AudioPlaybackInfo } from '@/services/AudioManager';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import {
  shouldShowOnboarding,
  markOnboardingCompleted,
  setSkipOnboarding,
} from '@/utils/onboardingUtils';

const { width } = Dimensions.get('window');

export const useDetailScreen = (route: any) => {
  const navigation = useNavigation<HomeStackNavigation>();
  const { state, loadMore } = useQuestionContext();

  // 安全地解构 route.params，处理可能为 undefined 的情况
  const params = route.params || { id: '', currentIndex: 0 };
  const { id, currentIndex = 0 } = params;

  // 获取当前问题数据
  const currentQuestion = state.questions.find((q: any) => q._id === id);

  // 控制导航栏显示状态
  const [showNav, setShowNav] = useState(true);
  const navOpacity = useSharedValue(1);
  const navTranslateYTop = useSharedValue(0); // 顶部导航栏初始位置在屏幕上方
  const navTranslateYBottom = useSharedValue(0); // 底部导航栏初始位置在屏幕下方

  // 新手引导状态
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 添加滚动偏移量跟踪
  const scrollOffset = useRef(0);
  const scrollOffsetThreshold = 10; // 滚动偏移量阈值

  // 控制目录抽屉显示状态
  const [showDirectory, setShowDirectory] = useState(false);
  const directoryTranslateX = useSharedValue(-width * 0.8);
  const overlayOpacity = useSharedValue(0); // 遮罩层透明度

  // 音频播放状态
  const [playbackInfo, setPlaybackInfo] = useState<AudioPlaybackInfo>({
    currentItemId: null,
    state: 'idle',
    currentAudioIndex: 0,
    totalAudios: 0,
  });

  // 引用组件
  const contentScrollViewRef = useRef(null);
  const directoryFlatListRef = useRef(null);

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
      navOpacity.value = withTiming(show ? 1 : 0, { duration: 300 });
      navTranslateYTop.value = withTiming(show ? 0 : -60, { duration: 300 });
      navTranslateYBottom.value = withTiming(show ? 0 : 60, { duration: 300 });
      setShowNav(show);
    },
    [navOpacity, navTranslateYTop, navTranslateYBottom],
  );

  // 目录抽屉动画
  const animateDirectory = useCallback(
    (show: boolean) => {
      directoryTranslateX.value = withTiming(show ? 0 : -width * 0.8, { duration: 300 });
      overlayOpacity.value = withTiming(show ? 1 : 0, { duration: 200 });
      setShowDirectory(show);
    },
    [directoryTranslateX, overlayOpacity],
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
        // @ts-ignore
        contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
        // @ts-ignore
        contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
      // @ts-ignore
      contentScrollViewRef.current?.scrollTo({ y: 0, animated: true });
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

    const { files: audioFiles, _id: questionId } = currentQuestion;

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
        audio_answer_simple: audioFiles.audio_answer_simple,
        audio_answer_detail: audioFiles.audio_answer_detail,
      });
    }
  }, [currentQuestion, playbackInfo]);

  // 处理设置
  const handleSettings = useCallback(() => {
    // 导航到Profile标签页，用户可以在那里访问设置选项
    // @ts-ignore
    navigation.navigate(routeNameMap.profileTab);
  }, [navigation]);

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
  const isDirectoryLoading = useRef(false);
  const handleDirectoryEndReached = useCallback(() => {
    // 确保不在加载过程中且还有更多数据可加载
    if (state.pagination.hasNext && !state.loading) {
      // 使用标志位防止重复触发
      if (!isDirectoryLoading.current) {
        isDirectoryLoading.current = true;
        loadMore().finally(() => {
          isDirectoryLoading.current = false;
        });
      }
    }
  }, [state.pagination.hasNext, state.loading, loadMore]);

  // 渲染目录底部加载指示器
  const renderDirectoryFooter = useCallback(() => {
    if (state.loading) {
      return { loading: true };
    }
    return { loading: false };
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

  return {
    // State
    showNav,
    navOpacity,
    navTranslateYTop,
    navTranslateYBottom,
    showOnboarding,
    showDirectory,
    directoryTranslateX,
    overlayOpacity,
    playbackInfo,
    setPlaybackInfo,
    contentScrollViewRef,
    directoryFlatListRef,
    currentQuestion,
    currentIndex,
    state,

    // Functions
    animateNav,
    animateDirectory,
    toggleNav,
    handleBack,
    handlePrev,
    handleNext,
    handleDirectory,
    handleDirectoryItemPress,
    handlePlayPause,
    handleSettings,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleDirectoryEndReached,
    renderDirectoryFooter,
    handleScroll,
  };
};