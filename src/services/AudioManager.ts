import { Platform } from 'react-native';
import TrackPlayer, { State, Event } from 'react-native-track-player';
import soundMap from '@/assets/question-audios/soundMap';

// 全局标记，表示 TrackPlayer 是否已在 App.tsx 中初始化
let isGlobalTrackPlayerInitialized = false;

// 设置全局初始化状态（由 App.tsx 调用）
export const setGlobalTrackPlayerInitialized = (initialized: boolean) => {
  isGlobalTrackPlayerInitialized = initialized;
};
export type AudioPlaybackState = 'idle' | 'playing' | 'paused' | 'error' | 'buffering';

export interface AudioPlaybackInfo {
  currentItemId: string | null;
  state: AudioPlaybackState;
  currentAudioIndex: number; // 0: question, 1: simple_answer, 2: analysis
  totalAudios: number;
}

export type AudioPlaybackListener = (info: AudioPlaybackInfo) => void;

class AudioManagerService {
  private currentItemId: string | null = null;
  private currentAudioIndex: number = 0;
  private audioQueue: string[] = [];
  private playbackState: AudioPlaybackState = 'idle';
  private listeners: Map<string, AudioPlaybackListener> = new Map();
  private isTrackPlayerInitialized: boolean = false;

  // 检查并确保 TrackPlayer 已就绪
  private async ensureTrackPlayerReady(): Promise<void> {
    if (this.isTrackPlayerInitialized) return;

    try {
      // 如果已经在 App.tsx 中全局初始化，直接标记为已初始化
      if (isGlobalTrackPlayerInitialized) {
        this.isTrackPlayerInitialized = true;
        console.log('TrackPlayer 已在 App.tsx 中全局初始化');
        return;
      }

      // 否则尝试初始化（备用方案）
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          TrackPlayer.Capability.Play,
          TrackPlayer.Capability.Pause,
          TrackPlayer.Capability.Stop,
          TrackPlayer.Capability.SeekTo,
        ],
        compactCapabilities: [
          TrackPlayer.Capability.Play,
          TrackPlayer.Capability.Pause,
        ],
        notificationCapabilities: [
          TrackPlayer.Capability.Play,
          TrackPlayer.Capability.Pause,
          TrackPlayer.Capability.Stop,
        ],
        progressUpdateEventInterval: 1000,
      });
      this.isTrackPlayerInitialized = true;
      console.log('TrackPlayer 本地初始化成功');

      // 设置播放完成事件监听
      this.setupTrackPlayerEvents();
    } catch (error) {
      // 如果初始化失败，检查是否是因为已经初始化过
      if (error.message.includes('already been initialized')) {
        console.log('TrackPlayer 已经初始化过');
        this.isTrackPlayerInitialized = true;
        return;
      }
      console.error('TrackPlayer 初始化失败:', error);
      throw error;
    }
  }

  // 设置 TrackPlayer 事件监听
  private setupTrackPlayerEvents(): void {
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      // 整个音频队列播放完成
      console.log('所有音频播放完成');
      this.playbackState = 'idle';
      this.currentItemId = null;
      this.currentAudioIndex = 0;
      this.audioQueue = [];
      this.notifyListeners();
    });

    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
      // 当前播放的音频发生变化
      if (data.nextTrack !== null && data.nextTrack !== undefined) {
        this.currentAudioIndex = data.nextTrack;
        console.log(`切换到音频 ${this.currentAudioIndex + 1}/${this.audioQueue.length}`);
        this.notifyListeners();
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackState, async (data) => {
      console.log('播放状态变化:', data.state);

      if (data.state === State.Playing) {
        this.playbackState = 'playing';
      } else if (data.state === State.Paused) {
        this.playbackState = 'paused';
      } else if (data.state === State.Stopped || data.state === State.None) {
        this.playbackState = 'idle';
      } else if (data.state === State.Buffering) {
        this.playbackState = 'buffering';
      }

      this.notifyListeners();
    });
  }

  // 添加监听器
  public addListener(id: string, listener: AudioPlaybackListener): void {
    this.listeners.set(id, listener);
  }

  // 移除监听器
  public removeListener(id: string): void {
    this.listeners.delete(id);
  }

  // 通知所有监听器
  private notifyListeners(): void {
    const info: AudioPlaybackInfo = {
      currentItemId: this.currentItemId,
      state: this.playbackState,
      currentAudioIndex: this.currentAudioIndex,
      totalAudios: this.audioQueue.length
    };

    this.listeners.forEach(listener => listener(info));
  }

  // 停止当前播放
  public async stopCurrent(): Promise<void> {
    try {
      if (this.isTrackPlayerInitialized) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      }
    } catch (error) {
      console.warn('停止播放时出错:', error);
    }

    this.currentItemId = null;
    this.currentAudioIndex = 0;
    this.audioQueue = [];
    this.playbackState = 'idle';
    this.notifyListeners();
  }

  // 暂停当前播放
  public async pauseCurrent(): Promise<void> {
    if (this.playbackState === 'playing') {
      try {
        if (this.isTrackPlayerInitialized) {
          await TrackPlayer.pause();
        }
        this.playbackState = 'paused';
        this.notifyListeners();
      } catch (error) {
        console.error('暂停播放失败:', error);
      }
    }
  }

  // 恢复播放
  public async resumeCurrent(): Promise<void> {
    if (this.playbackState === 'paused') {
      try {
        if (this.isTrackPlayerInitialized) {
          await TrackPlayer.play();
          this.playbackState = 'playing';
          this.notifyListeners();
        }
      } catch (error) {
        console.error('恢复播放失败:', error);
        this.handlePlaybackError();
      }
    }
  }

  // 开始播放音频队列
  public async startPlayback(itemId: string, audioFiles: {
    audio_question?: string;
    audio_answer_simple?: string;
    audio_answer_detail?: string;
  }): Promise<void> {
    try {
      // 确保 TrackPlayer 已就绪
      await this.ensureTrackPlayerReady();

      // 如果当前正在播放其他项目，先停止
      if (this.currentItemId && this.currentItemId !== itemId) {
        await this.stopCurrent();
      }

      // 如果是同一个项目，根据当前状态处理
      if (this.currentItemId === itemId) {
        if (this.playbackState === 'playing') {
          await this.pauseCurrent();
          return;
        } else if (this.playbackState === 'paused') {
          await this.resumeCurrent();
          return;
        }
        // 如果是同一个项目但状态是 idle，重新构建队列
        await this.stopCurrent();
      }

      // 构建音频队列
      this.audioQueue = [];
      console.log(audioFiles.audio_answer_detail, 'audioFiles.audio_answer_detail');
      console.log(audioFiles.audio_answer_simple, 'audioFiles.audio_answer_simple');
      if (audioFiles.audio_question) this.audioQueue.push(audioFiles.audio_question);
      if (audioFiles.audio_answer_simple) this.audioQueue.push(audioFiles.audio_answer_simple);
      if (audioFiles.audio_answer_detail) this.audioQueue.push(audioFiles.audio_answer_detail);

      if (this.audioQueue.length === 0) {
        console.warn('No audio files available for playback');
        return;
      }

      this.currentItemId = itemId;
      this.currentAudioIndex = 0;
      await this.playCurrentAudioWithTrackPlayer();
    } catch (error) {
      console.error('开始播放失败:', error);
      this.handlePlaybackError();
    }
  }

  // 使用 TrackPlayer 播放当前音频
  private async playCurrentAudioWithTrackPlayer(): Promise<void> {
    if (this.currentAudioIndex >= this.audioQueue.length) {
      // 播放完成
      await this.stopCurrent();
      return;
    }

    const audioFile = this.audioQueue[this.currentAudioIndex];
    console.log(`Playing audio ${this.currentAudioIndex + 1}/${this.audioQueue.length}: ${audioFile}`);

    try {
      // 只在第一次播放时清空队列并添加所有音频
      if (this.currentAudioIndex === 0) {
        await TrackPlayer.reset();
        console.log('队列已清空');

        // 一次性添加所有音频到队列
        const tracks = this.audioQueue.map((file, index) => {
          const audioResource = soundMap[file.split('.')[0]];
          if (!audioResource) {
            console.warn(`音频资源未找到: ${file}`);
            return null;
          }

          return {
            id: index.toString(),
            url: audioResource,
            title: this.getAudioTitle(index),
            artist: '刷题派',
          };
        }).filter(track => track !== null);

        if (tracks.length === 0) {
          console.warn('没有有效的音频资源');
          this.handlePlaybackError();
          return;
        }

        await TrackPlayer.add(tracks);
        console.log(`已添加 ${tracks.length} 个音频到队列`);
      }

      // 跳转到当前音频位置
      await TrackPlayer.skip(this.currentAudioIndex);
      console.log(`已跳转到音频位置: ${this.currentAudioIndex}`);

      // 开始播放
      await TrackPlayer.play();
      console.log('播放命令已发送');

      // 更新播放状态
      this.playbackState = 'playing';
      this.notifyListeners();

    } catch (error) {
      console.error('播放失败:', error);
      this.handlePlaybackError();
    }
  }

  // 获取音频标题
  private getAudioTitle(index: number): string {
    const titles = ['题目', '精简答案', '扩展答案'];
    return titles[index] || '音频';
  }



  // 处理播放错误
  private handlePlaybackError(): void {
    this.playbackState = 'error';
    this.notifyListeners();

    // 3秒后重置状态
    setTimeout(() => {
      this.stopCurrent();
    }, 3000);
  }

  // 获取当前播放信息
  public getCurrentPlaybackInfo(): AudioPlaybackInfo {
    return {
      currentItemId: this.currentItemId,
      state: this.playbackState,
      currentAudioIndex: this.currentAudioIndex,
      totalAudios: this.audioQueue.length
    };
  }

  // 检查特定项目是否正在播放
  public isItemPlaying(itemId: string): boolean {
    return this.currentItemId === itemId && this.playbackState === 'playing';
  }

  // 检查特定项目是否暂停
  public isItemPaused(itemId: string): boolean {
    return this.currentItemId === itemId && this.playbackState === 'paused';
  }
}

// 导出单例实例
export const AudioManager = new AudioManagerService();