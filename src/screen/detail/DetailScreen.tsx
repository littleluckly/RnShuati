import React, {useEffect, useState} from 'react';
import {View, StatusBar, BackHandler, Text, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import {useDetailScreen} from './hooks';
import {TopNavigationBar} from './components/TopNavigationBar';
import {BottomNavigationBar} from './components/BottomNavigationBar';
import {DirectoryDrawer} from './components/DirectoryDrawer';
import {ContentArea} from './components/ContentArea';
import {SettingsPanel} from './components/SettingsPanel';
import {styles} from './styles/styles';
import {DetailScreenRouteProp} from './types';
import {HomeStackNavigation} from '@/navigation/Types';
import {AudioManager, AudioPlaybackInfo} from '@/services/AudioManager';
import {useQuestionContext} from '@/contexts/QuestionContext';
import {State} from 'react-native-track-player';

export default function DetailScreen() {
  const {state: questionState, loadMore} = useQuestionContext();
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<HomeStackNavigation>();
  const [isAutoLoading, setIsAutoLoading] = useState(false); // 添加自动加载状态
  const insets = useSafeAreaInsets();
  const {
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
    contentScrollViewRef,
    directoryFlatListRef,
    currentQuestion,
    currentIndex,
    state,
    setPlaybackInfo,

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
    handleLoopModeChange,
    handleContentSettingsChange,
  } = useDetailScreen(route);

  // // 处理硬件返回键
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     () => {
  //       if (showDirectory) {
  //         animateDirectory(false);
  //         return true;
  //       }
  //       if (showNav) {
  //         animateNav(false);
  //         return true;
  //       }
  //       return false;
  //     },
  //   );
  //   console.log('处理硬件返回键');
  //   return () => backHandler.remove();
  // }, [showNav, showDirectory, animateNav, animateDirectory]);

  // 状态栏和导航设置
  useEffect(() => {
    // 设置状态栏样式
    StatusBar.setBarStyle('dark-content');
    // 只在Android平台上设置状态栏背景色
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#ffffff');
    }

    // 隐藏底部标签栏
    navigation.getParent()?.setOptions({
      tabBarStyle: {display: 'none'},
    });

    return () => {
      // 组件卸载时恢复状态栏设置
      StatusBar.setBarStyle('dark-content');
      // 只在Android平台上设置状态栏背景色
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#f5f7fa');
      }
      // 恢复底部标签栏
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'flex'},
      });
      // 组件卸载时停止音频播放
      AudioManager.stopCurrent();
    };
  }, [navigation]);

  // 确保在设置面板打开时导航栏不隐藏
  useEffect(() => {
    if (showSettingsPanel) {
      // 如果设置面板打开，确保导航栏显示
      animateNav(true);
    }
  }, [showSettingsPanel, animateNav]);

  // 检查剩余题目数量，当少于5题时触发加载更多
  useEffect(() => {
    // 防止在目录抽屉打开时触发自动加载，避免与目录抽屉的加载更多冲突
    if (showDirectory) {
      return;
    }

    // 确保不在加载过程中且还有更多数据可加载，并且当前没有在进行自动加载
    if (
      questionState.pagination.hasNext &&
      !questionState.loading &&
      !isAutoLoading
    ) {
      // 计算剩余题目数量：当前已加载的题目数量 - 当前索引
      const remainingQuestions =
        questionState.questions.length - (currentIndex + 1);
      // 如果剩余题目数量少于5题，触发加载更多
      if (remainingQuestions < 5) {
        setIsAutoLoading(true);
        loadMore().finally(() => {
          setIsAutoLoading(false);
        });
      }
    }
  }, [
    currentIndex,
    questionState.questions.length,
    questionState.pagination.hasNext,
    questionState.loading,
    loadMore,
    showDirectory,
    isAutoLoading,
  ]);

  if (!currentQuestion) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}>
        <TopNavigationBar
          navOpacity={navOpacity}
          navTranslateYTop={navTranslateYTop}
          handleBack={handleBack}
          currentIndex={currentIndex}
          total={state.pagination.total}
        />
        <View style={styles.content}>
          <Text style={styles.notFoundText}>题目未找到</Text>
        </View>
      </View>
    );
  }

  // 使用useState和useEffect结合，确保UI能响应AudioManager状态变化
  const [isPlaying, setIsPlaying] = useState(false);

  // 监听AudioManager状态变化，确保播放状态与UI同步
  useEffect(() => {
    // 初始状态检查
    setIsPlaying(AudioManager.isItemPlaying(currentQuestion._id));

    // 添加状态变化监听器
    const handlePlaybackChange = (playbackInfo: AudioPlaybackInfo) => {
      // 直接使用AudioManager传递的播放信息更新状态
      setIsPlaying(
        playbackInfo.currentItemId === currentQuestion._id &&
          playbackInfo.state === State.Playing,
      );
    };

    AudioManager.addListener('detailScreenPlayState', handlePlaybackChange);

    // 组件卸载时移除监听器
    return () => {
      AudioManager.removeListener('detailScreenPlayState');
    };
  }, [currentQuestion._id]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      {/* 目录抽屉 */}
      <DirectoryDrawer
        showDirectory={showDirectory}
        directoryTranslateX={directoryTranslateX}
        overlayOpacity={overlayOpacity}
        animateDirectory={animateDirectory}
        questions={state.questions}
        currentQuestionId={currentQuestion._id}
        handleDirectoryItemPress={handleDirectoryItemPress}
        directoryFlatListRef={directoryFlatListRef}
        handleDirectoryEndReached={handleDirectoryEndReached}
        renderDirectoryFooter={renderDirectoryFooter}
      />

      {/* 顶部导航栏 */}
      <TopNavigationBar
        navOpacity={navOpacity}
        navTranslateYTop={navTranslateYTop}
        handleBack={handleBack}
        currentIndex={currentIndex}
        total={state.pagination.total}
        title={currentQuestion.question_markdown}
      />

      {/* 内容区域 - 全屏展示 */}
      <ContentArea
        contentScrollViewRef={contentScrollViewRef}
        handleScroll={handleScroll}
        toggleNav={toggleNav}
        question={currentQuestion.question_markdown}
        simpleAnswer={currentQuestion.answer_simple_markdown}
        detailAnswer={currentQuestion.answer_detail_markdown || '暂无扩展答案'}
        analysisAnswer={currentQuestion.answer_analysis_markdown}
      />

      {/* 底部导航栏 */}
      <BottomNavigationBar
        navOpacity={navOpacity}
        navTranslateYBottom={navTranslateYBottom}
        handlePrev={handlePrev}
        handleNext={handleNext}
        handleDirectory={handleDirectory}
        handleSettings={handleSettings}
        currentIndex={currentIndex}
        totalQuestions={state.questions.length}
        handlePlayPause={handlePlayPause}
        isPlaying={isPlaying}
      />

      {/* 设置面板 */}
      <SettingsPanel
        show={showSettingsPanel}
        settingsPanelTranslateY={settingsPanelTranslateY}
        settingsOverlayOpacity={settingsOverlayOpacity}
        playbackSpeed={playbackSpeed}
        loopMode={loopMode}
        playbackContentSettings={playbackContentSettings}
        handleSpeedChange={handleSpeedChange}
        handleLoopModeChange={handleLoopModeChange}
        handleContentSettingsChange={handleContentSettingsChange}
        animateSettingsPanel={animateSettingsPanel}
      />

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
