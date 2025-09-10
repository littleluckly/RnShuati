import React, {useEffect} from 'react';
import {View, StatusBar, BackHandler, Text} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import {useDetailScreen} from './hooks';
import {TopNavigationBar} from './components/TopNavigationBar';
import {BottomNavigationBar} from './components/BottomNavigationBar';
import {PlayButton} from './components/PlayButton';
import {DirectoryDrawer} from './components/DirectoryDrawer';
import {ContentArea} from './components/ContentArea';
import {styles} from './styles/styles';
import {DetailScreenRouteProp} from './types';
import {HomeStackNavigation} from '@/navigation/Types';
import {AudioManager} from '@/services/AudioManager';
import {useQuestionContext} from '@/contexts/QuestionContext';

export default function DetailScreen() {
  const {state: questionState, loadMore} = useQuestionContext();
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<HomeStackNavigation>();
  const {
    // State
    showNav,
    navOpacity,
    navTranslateYTop,
    navTranslateYBottom,
    showOnboarding,
    showDirectory,
    directoryTranslateX,
    playbackInfo,
    contentScrollViewRef,
    directoryFlatListRef,
    currentQuestion,
    currentIndex,
    state,
    setPlaybackInfo,

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
  } = useDetailScreen(route);

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

  // 检查剩余题目数量，当少于5题时触发加载更多
  useEffect(() => {
    if (questionState.pagination.hasNext && !questionState.loading) {
      // 计算剩余题目数量：当前已加载的题目数量 - 当前索引
      const remainingQuestions =
        questionState.questions.length - (currentIndex + 1);
      // 如果剩余题目数量少于5题，触发加载更多
      if (remainingQuestions < 5) {
        loadMore();
      }
    }
  }, [
    currentIndex,
    questionState.questions.length,
    questionState.pagination.hasNext,
    questionState.loading,
    loadMore,
  ]);

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
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

  const isPlaying =
    playbackInfo.currentItemId === currentQuestion._id &&
    playbackInfo.state === 'playing';

  return (
    <View style={styles.container}>
      {/* 目录抽屉 */}
      <DirectoryDrawer
        showDirectory={showDirectory}
        directoryTranslateX={directoryTranslateX}
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
      />

      {/* 播放按钮 - 紧挨着底部导航的右上侧 */}
      <PlayButton
        navOpacity={navOpacity}
        navTranslateYBottom={navTranslateYBottom}
        handlePlayPause={handlePlayPause}
        isPlaying={isPlaying}
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
