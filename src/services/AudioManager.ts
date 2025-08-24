import Sound from 'react-native-sound';

export type AudioPlaybackState = 'idle' | 'playing' | 'paused' | 'error';

export interface AudioPlaybackInfo {
  currentItemId: string | null;
  state: AudioPlaybackState;
  currentAudioIndex: number; // 0: question, 1: simple_answer, 2: analysis
  totalAudios: number;
}

export type AudioPlaybackListener = (info: AudioPlaybackInfo) => void;

class AudioManagerService {
  private currentSound: Sound | null = null;
  private currentItemId: string | null = null;
  private currentAudioIndex: number = 0;
  private audioQueue: string[] = [];
  private playbackState: AudioPlaybackState = 'idle';
  private listeners: Map<string, AudioPlaybackListener> = new Map();

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
  public stopCurrent(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
    this.currentItemId = null;
    this.currentAudioIndex = 0;
    this.audioQueue = [];
    this.playbackState = 'idle';
    this.notifyListeners();
  }

  // 暂停当前播放
  public pauseCurrent(): void {
    if (this.currentSound && this.playbackState === 'playing') {
      this.currentSound.pause();
      this.playbackState = 'paused';
      this.notifyListeners();
    }
  }

  // 恢复播放
  public resumeCurrent(): void {
    if (this.currentSound && this.playbackState === 'paused') {
      this.currentSound.play((success) => {
        if (success) {
          this.playNextInQueue();
        } else {
          this.handlePlaybackError();
        }
      });
      this.playbackState = 'playing';
      this.notifyListeners();
    }
  }

  // 开始播放音频队列
  public startPlayback(itemId: string, audioFiles: {
    audio_question?: string;
    audio_simple?: string;
    audio_analysis?: string;
  }): void {
    // 如果当前正在播放其他项目，先停止
    if (this.currentItemId && this.currentItemId !== itemId) {
      this.stopCurrent();
    }

    // 如果是同一个项目，根据当前状态处理
    if (this.currentItemId === itemId) {
      if (this.playbackState === 'playing') {
        this.pauseCurrent();
        return;
      } else if (this.playbackState === 'paused') {
        this.resumeCurrent();
        return;
      }
    }

    // 构建音频队列
    this.audioQueue = [];
    if (audioFiles.audio_question) this.audioQueue.push(audioFiles.audio_question);
    if (audioFiles.audio_simple) this.audioQueue.push(audioFiles.audio_simple);
    if (audioFiles.audio_analysis) this.audioQueue.push(audioFiles.audio_analysis);

    if (this.audioQueue.length === 0) {
      console.warn('No audio files available for playback');
      return;
    }

    this.currentItemId = itemId;
    this.currentAudioIndex = 0;
    this.playCurrentAudio();
  }

  // 播放当前音频
  private playCurrentAudio(): void {
    if (this.currentAudioIndex >= this.audioQueue.length) {
      // 播放完成
      this.stopCurrent();
      return;
    }

    const audioFile = this.audioQueue[this.currentAudioIndex];
    console.log(`Playing audio ${this.currentAudioIndex + 1}/${this.audioQueue.length}: ${audioFile}`);

    this.currentSound = new Sound(audioFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load audio:', error);
        this.handlePlaybackError();
        return;
      }

      this.playbackState = 'playing';
      this.notifyListeners();

      this.currentSound?.play((success) => {
        if (success) {
          console.log(`Audio ${this.currentAudioIndex + 1} completed successfully`);
          this.playNextInQueue();
        } else {
          console.error('Audio playback failed');
          this.handlePlaybackError();
        }
      });
    });
  }

  // 播放队列中的下一个音频
  private playNextInQueue(): void {
    if (this.currentSound) {
      this.currentSound.release();
      this.currentSound = null;
    }

    this.currentAudioIndex++;

    // 添加短暂延迟，让用户感知到切换
    setTimeout(() => {
      this.playCurrentAudio();
    }, 500);
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