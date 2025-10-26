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


let isInitialized = false;
/**
 * 初始化 TrackPlayer 播放器
 * @returns Promise<boolean> 初始化是否成功
 */
export const initializeTrackPlayer = async (): Promise<boolean> => {
  try {
    // 设置播放器
    await TrackPlayer.setupPlayer({
      // 添加Android特定的播放器选项
      waitForBuffer: true,
      maxCacheSize: 1000000,
      minBuffer: 5,
      maxBuffer: 20,
      autoUpdateMetadata: true,
    });

    // 配置播放器选项
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        // Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        // Capability.SeekTo,
        // Capability.JumpForward,  // 可选
        // Capability.JumpBackward, // 可选
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
        // Capability.Stop,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        // Capability.SeekTo,
      ],
      progressUpdateEventInterval: 1000,
      color: parseInt('FF4500', 16), // 确保是有效的颜色值

      // Android 特定配置
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.PausePlayback,
        stopForegroundGracePeriod: 30,
        alwaysPauseOnInterruption: true,
      },

    });

    console.log('✅ TrackPlayer 初始化成功');
    isInitialized = true;
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
export const isTrackPlayerInitialized = (): boolean => {
  return isInitialized
};

/**
 * 安全的 TrackPlayer 初始化包装器
 * 确保只初始化一次，避免重复初始化错误
 */
let isInitializing = false;
let initializationPromise: Promise<boolean> | null = null;

export const safeInitializeTrackPlayer = async (): Promise<boolean> => {
  // 如果正在初始化，返回同一个 Promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // 检查是否已经初始化
  const alreadyInitialized = isTrackPlayerInitialized();
  if (alreadyInitialized) {
    console.log('ℹ️ TrackPlayer 已经初始化，跳过重复初始化');
    setGlobalTrackPlayerInitialized(true);
    return true;
  }

  isInitializing = true;
  initializationPromise = initializeTrackPlayer()
    .finally(() => {
      isInitializing = false;
    });

  return initializationPromise;
};
