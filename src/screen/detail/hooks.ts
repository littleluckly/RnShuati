import { useState, useCallback, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeStackNavigation } from '@/navigation/Types';
import { routeNameMap } from '@/navigation/constant';
import { useQuestionContext } from '@/contexts/QuestionContext';
import { AudioManager, AudioPlaybackInfo, PlaybackContentSettings } from '@/services/AudioManager';
import loopAudioManager, { LoopMode } from '@/services/LoopAudioManager';
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

  // 控制设置面板显示状态
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const settingsPanelTranslateY = useSharedValue(300); // 设置面板初始位置在屏幕下方
  const settingsOverlayOpacity = useSharedValue(0); // 设置面板遮罩层透明度
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 播放速度状态
  const [playbackContentSettings, setPlaybackContentSettings] = useState<PlaybackContentSettings>({
    includeSimpleAnswer: true,
    includeDetailAnswer: true,
  }); // 播放内容设置状态
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.None); // 循环模式状态

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

  // 组件挂载时添加音频监听器
  useEffect(() => {
    AudioManager.addListener('detailScreen', setPlaybackInfo);

    // 初始化播放设置
    const initPlaybackSettings = async () => {
      try {
        // 初始化播放速度
        const speed = await AudioManager.getPlaybackSpeed();
        setPlaybackSpeed(speed);

        // 初始化循环模式
        await loopAudioManager.loadLocalLoopMode();
        setLoopMode(loopAudioManager.loopMode);
      } catch (error) {
        console.error('初始化播放设置失败:', error);
        // 出错时使用默认值
        setPlaybackSpeed(1.0);
        setLoopMode(LoopMode.None);
      }
    };

    initPlaybackSettings();

    return () => {
      AudioManager.removeListener('detailScreen');
    };
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

  // 设置面板动画
  const animateSettingsPanel = useCallback(
    async (show: boolean) => {
      settingsPanelTranslateY.value = withTiming(show ? 0 : 300, { duration: 300 });
      settingsOverlayOpacity.value = withTiming(show ? 1 : 0, { duration: 200 });
      setShowSettingsPanel(show);

      // 如果显示设置面板，获取当前播放速度和内容设置
      if (show) {
        try {
          // 获取播放速度
          await AudioManager.loadPlaybackSpeed();
          const speed = await AudioManager.getPlaybackSpeed();
          setPlaybackSpeed(speed);

          // 获取播放内容设置

          // 加载用户的播放设置
          await AudioManager.loadPlaybackContentSettings();
          const settings = AudioManager.getPlaybackContentSettings();
          setPlaybackContentSettings(settings);

          // 获取循环模式
          await loopAudioManager.loadLocalLoopMode();
          setLoopMode(loopAudioManager.loopMode);
        } catch (error) {
          console.error('获取播放设置失败:', error);
        }
      }
    },
    [settingsPanelTranslateY, settingsOverlayOpacity],
  );

  // 添加useEffect监听设置面板状态变化
  useEffect(() => {
    if (showSettingsPanel) {
      // 当设置面板打开时，获取最新的播放速度
      const updatePlaybackSpeed = async () => {
        try {
          const speed = await AudioManager.getPlaybackSpeed();
          setPlaybackSpeed(speed);
        } catch (error) {
          console.error('获取播放速度失败:', error);
        }
      };

      updatePlaybackSpeed();
    }
  }, [showSettingsPanel]);

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
        // 重置内容区域滚动位置，但不触发导航栏隐藏
        // 先强制显示导航栏并暂时禁用滚动事件处理
        animateNav(true);
        // 使用requestAnimationFrame确保在下一帧执行滚动，避免与当前动画冲突
        requestAnimationFrame(() => {
          // @ts-ignore
          contentScrollViewRef.current?.scrollTo({ y: 0, animated: false });
          // 立即导航到新题目，避免滚动事件触发
          navigation.navigate(routeNameMap.detailScreen, {
            id: prevQuestion._id,
            currentIndex: prevIndex,
          });
        });
      }
    }
  }, [currentIndex, navigation, state.questions, animateNav]);

  // 处理下一题
  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < state.questions.length) {
      const nextQuestion = state.questions[nextIndex];
      if (nextQuestion) {
        // 停止当前音频播放
        AudioManager.stopCurrent();
        // 重置内容区域滚动位置，但不触发导航栏隐藏
        // 先强制显示导航栏并暂时禁用滚动事件处理
        animateNav(true);
        // 使用requestAnimationFrame确保在下一帧执行滚动，避免与当前动画冲突
        requestAnimationFrame(() => {
          // @ts-ignore
          contentScrollViewRef.current?.scrollTo({ y: 0, animated: false });
          // 立即导航到新题目，避免滚动事件触发
          navigation.navigate(routeNameMap.detailScreen, {
            id: nextQuestion._id,
            currentIndex: nextIndex,
          });
        });
      }
    }
  }, [currentIndex, navigation, state.questions, animateNav]);

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
      // 重置内容区域滚动位置，但不触发导航栏隐藏
      // 先强制显示导航栏并暂时禁用滚动事件处理
      animateNav(true);
      // 使用requestAnimationFrame确保在下一帧执行滚动，避免与当前动画冲突
      requestAnimationFrame(() => {
        // @ts-ignore
        contentScrollViewRef.current?.scrollTo({ y: 0, animated: false });
        // 立即导航到新题目，避免滚动事件触发
        navigation.navigate(routeNameMap.detailScreen, {
          id: questionId,
          currentIndex: index,
        });
      });
    },
    [navigation, animateDirectory, animateNav],
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
      } else if (playbackInfo.state === 'idle') {
        // 如果当前是idle状态，重新开始播放
        AudioManager.startPlayback(questionId, {
          audio_question: audioFiles.audio_question,
          audio_answer_simple: audioFiles.audio_answer_simple,
          audio_answer_detail: audioFiles.audio_answer_detail,
        });
      }
    }
    // 如果没有播放任何内容或播放的是其他题目，则开始播放
    else {
      AudioManager.startPlayback(questionId, {
        audio_question: audioFiles.audio_question,
        audio_answer_simple: audioFiles.audio_answer_simple,
        audio_answer_detail: audioFiles.audio_answer_detail,
      });
    }
  }, [currentQuestion, playbackInfo]);

  // 组件卸载时清理音频监听器
  useEffect(() => {
    return () => {
      AudioManager.removeListener('detailScreen');
    };
  }, []);

  // 处理设置
  const handleSettings = useCallback(() => {
    // 显示设置面板
    animateSettingsPanel(true);
  }, [animateSettingsPanel]);

  // 处理播放速度变化
  const handleSpeedChange = useCallback(async (speed: number) => {
    setPlaybackSpeed(speed);
    await AudioManager.setPlaybackSpeed(speed);
  }, []);

  // 处理播放内容设置变化
  const handleContentSettingsChange = useCallback(async (settings: PlaybackContentSettings) => {
    try {
      setPlaybackContentSettings(settings);
      await AudioManager.setPlaybackContentSettings(settings);
      // 如果当前正在播放，重新开始播放以应用新的内容设置
      if (playbackInfo.currentItemId && currentQuestion) {
        AudioManager.stopCurrent();
        AudioManager.startPlayback(playbackInfo.currentItemId, {
          audio_question: currentQuestion.files?.audio_question,
          audio_answer_simple: currentQuestion.files?.audio_answer_simple,
          audio_answer_detail: currentQuestion.files?.audio_answer_detail,
        });
      }
    } catch (error) {
      console.error('设置播放内容失败:', error);
      // 恢复之前的设置
      setPlaybackContentSettings(AudioManager.getPlaybackContentSettings());
    }
  }, [playbackInfo.currentItemId, currentQuestion]);

  // 处理循环模式变化
  const handleLoopModeChange = useCallback(async (mode: LoopMode) => {
    try {
      setLoopMode(mode);
      await loopAudioManager.setLoopMode(mode);
      // 如果当前正在播放，重新开始播放以应用新的循环模式
      if (playbackInfo.currentItemId && currentQuestion) {
        AudioManager.stopCurrent();
        // todo: 切换循环模式后，需要在播放结束中判断循环模式，决定是否重新播放，还是切换到下一题
        // AudioManager.startPlayback(playbackInfo.currentItemId, {
        //   audio_question: currentQuestion.files?.audio_question,
        //   audio_answer_simple: currentQuestion.files?.audio_answer_simple,
        //   audio_answer_detail: currentQuestion.files?.audio_answer_detail,
        // });
      }
    } catch (error) {
      console.error('设置循环模式失败:', error);
      // 恢复之前的模式
      await loopAudioManager.loadLocalLoopMode();
      setLoopMode(loopAudioManager.loopMode);
    }
  }, [playbackInfo.currentItemId, currentQuestion]);

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

  // 添加内容高度和滚动视图高度的跟踪
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  // 处理滚动事件
  const handleScroll = useCallback(
    (event: any) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const delta = currentOffset - scrollOffset.current;

      // 获取内容高度和滚动视图高度
      contentHeight.current = event.nativeEvent.contentSize.height;
      scrollViewHeight.current = event.nativeEvent.layoutMeasurement.height;

      // 检测是否滚动到顶部或底部
      const isAtTop = currentOffset <= 0;
      const isAtBottom = currentOffset + scrollViewHeight.current >= contentHeight.current - 1; // 1px容差

      // 如果滚动到顶部或底部，显示导航栏
      if (isAtTop || isAtBottom) {
        if (!showNav) {
          animateNav(true);
        }
      } else {
        // 只有当滚动偏移量超过阈值时才隐藏导航栏
        if (Math.abs(delta) > scrollOffsetThreshold) {
          // 无论向上还是向下滚动，都隐藏导航栏
          if (showNav) {
            animateNav(false);
          }
        }
      }

      // 更新滚动偏移量
      scrollOffset.current = currentOffset;
    },
    [showNav, animateNav],
  );

  // 添加useEffect监听设置面板状态变化
  useEffect(() => {
    if (showSettingsPanel) {
      // 当设置面板打开时，获取最新的播放速度
      const updatePlaybackSpeed = async () => {
        try {
          const speed = await AudioManager.getPlaybackSpeed();
          setPlaybackSpeed(speed);
        } catch (error) {
          console.error('获取播放速度失败:', error);
        }
      };

      updatePlaybackSpeed();
    }
  }, [showSettingsPanel]);

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

    // 设置面板相关状态
    showSettingsPanel,
    settingsPanelTranslateY,
    settingsOverlayOpacity,
    playbackSpeed,
    playbackContentSettings,
    loopMode,

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
    animateSettingsPanel,
    handleSpeedChange,
    handleContentSettingsChange,
    handleLoopModeChange,
  };
};