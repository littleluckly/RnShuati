// TrackPlayerInitializer.ts
// TrackPlayer 全局初始化服务

import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { setGlobalTrackPlayerInitialized } from './AudioManager';

/**
 * TrackPlayer 初始化配置选项
 */
export interface TrackPlayerOptions {
  /** 是否启用播放能力 */
  enablePlay?: boolean;
  /** 是否启用暂停能力 */
  enablePause?: boolean;
  /** 是否启用停止能力 */
  enableStop?: boolean;
  /** 是否启用跳转能力 */
  enableSeek?: boolean;
  /** 进度更新间隔（毫秒） */
  progressUpdateInterval?: number;
  /** 是否启用后台播放 */
  enableBackgroundPlayback?: boolean;
}

/**
 * 默认的 TrackPlayer 配置选项
 */
const DEFAULT_OPTIONS: TrackPlayerOptions = {
  enablePlay: true,
  enablePause: true,
  enableStop: true,
  enableSeek: true,
  progressUpdateInterval: 1000,
  enableBackgroundPlayback: true,
};

/**
 * 初始化 TrackPlayer 播放器
 * @param options 自定义配置选项
 * @returns Promise<boolean> 初始化是否成功
 */
export const initializeTrackPlayer = async (
  options: TrackPlayerOptions = DEFAULT_OPTIONS
): Promise<boolean> => {
  try {
    // 设置播放器
    await TrackPlayer.setupPlayer({
      // 添加Android特定的播放器选项
      waitForBuffer: true,
      maxCacheSize: 1000000,
      minBuffer: 5,
      maxBuffer: 20
    });

    // 配置播放器选项
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.JumpForward,  // 可选
        Capability.JumpBackward, // 可选
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      progressUpdateEventInterval: 1000,
      color: parseInt('FF4500', 16), // 确保是有效的颜色值

      // Android 特定配置
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        stopForegroundGracePeriod: 30,
        alwaysPauseOnInterruption: true,
        // 添加以下内容确保媒体会话激活
        shouldStartForegroundService: true, // 关键：启动前台服务
      },

      // 图标资源（确保路径正确且图片存在）
      icon: require('../assets/image/work.png'),
      playIcon: require('../assets/image/work.png'),
      pauseIcon: require('../assets/image/work.png'),
      stopIcon: require('../assets/image/work.png'),
      previousIcon: require('../assets/image/work.png'),
      nextIcon: require('../assets/image/work.png'),
    });

    console.log('✅ TrackPlayer 初始化成功');

    // 通知 AudioManager 全局初始化已完成
    setGlobalTrackPlayerInitialized(true);

    return true;
  } catch (error) {
    console.error('❌ TrackPlayer 初始化失败:', error);

    // 处理特定的初始化错误
    if (error instanceof Error) {
      if (error.message.includes('already been initialized')) {
        console.log('ℹ️ TrackPlayer 已经初始化过');
        setGlobalTrackPlayerInitialized(true);
        return true;
      }
    }

    return false;
  }
};

/**
 * 重置 TrackPlayer 播放器
 * @returns Promise<void>
 */
export const resetTrackPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
    console.log('✅ TrackPlayer 已重置');
  } catch (error) {
    console.warn('⚠️ TrackPlayer 重置时出错:', error);
  }
};

/**
 * 检查 TrackPlayer 是否已初始化
 * @returns Promise<boolean>
 */
export const isTrackPlayerInitialized = async (): Promise<boolean> => {
  try {
    // 尝试获取当前曲目，如果成功说明已初始化
    await TrackPlayer.getCurrentTrack();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 安全的 TrackPlayer 初始化包装器
 * 确保只初始化一次，避免重复初始化错误
 */
let isInitializing = false;
let initializationPromise: Promise<boolean> | null = null;

export const safeInitializeTrackPlayer = async (
  options?: TrackPlayerOptions
): Promise<boolean> => {
  // 如果正在初始化，返回同一个 Promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // 检查是否已经初始化
  const alreadyInitialized = await isTrackPlayerInitialized();
  if (alreadyInitialized) {
    console.log('ℹ️ TrackPlayer 已经初始化，跳过重复初始化');
    setGlobalTrackPlayerInitialized(true);
    return true;
  }

  isInitializing = true;
  initializationPromise = initializeTrackPlayer(options)
    .finally(() => {
      isInitializing = false;
    });

  return initializationPromise;
};

// 导出默认配置
export { DEFAULT_OPTIONS };