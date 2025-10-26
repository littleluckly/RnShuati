// TrackPlayer播放服务文件
// 用于处理后台播放和事件回调

import TrackPlayer, { Event, State } from 'react-native-track-player';

/**
 * TrackPlayer播放服务
 * 处理音频播放事件和后台播放功能
 */
export default async function playbackService() {
  // 监听播放状态变化
  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    // 根据需要处理播放状态变化
    switch (event.state) {
      case State.Playing:
        console.log('[播放服务] 开始播放--正在播放');
        break;
      case State.Paused:
        console.log('[播放服务] 暂停播放');
        break;
      case State.Stopped:
        console.log('[播放服务] 停止播放');
        break;
      case State.Ended:
        console.log('[播放服务] 播放结束');
        break;
      case State.Buffering:
        console.log('[播放服务] 缓冲中');
        break;
      default:
        break;
    }
  });

  // 监听队列播放结束事件
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    console.log('[播放服务] 队列播放结束');
    // 可以在这里添加自动重播逻辑或其他处理
  });

  // 监听曲目切换事件
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
    if (event.track !== null) {
      console.log(`[播放服务] 切换到曲目: ${event.track}`);
    }
  });

  // 监听错误事件
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('[播放服务] 播放错误:', error);
  });

  // 监听进度更新事件
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (progress) => {
    // 可以在这里更新UI或执行其他进度相关操作
    // 注意：过于频繁的更新可能会影响性能
  });

  // 监听远程控制事件（通知栏按钮点击）
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('[播放服务] 远程控制：播放');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('[播放服务] 远程控制：暂停');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('[播放服务] 远程控制：停止');
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('[播放服务] 远程控制：下一曲');
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('[播放服务] 远程控制：上一曲');
    TrackPlayer.skipToPrevious();
  });

  // 监听跳转事件
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log(`[播放服务] 远程控制：跳转到 ${event.position} 秒`);
    TrackPlayer.seekTo(event.position);
  });

  // 服务启动时的日志
  console.log('[播放服务] TrackPlayer播放服务已启动');
}