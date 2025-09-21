import TrackPlayer, { Capability, State, Event } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 全局标记，表示 TrackPlayer 是否已在 App.tsx 中初始化
let isGlobalTrackPlayerInitialized = false;

// 全局存储音频映射表，由 App.tsx 在启动时设置
let soundMap: Record<string, any> = {};

// 存储键
const PLAYBACK_CONTENT_SETTINGS_KEY = 'playback_content_settings';
const PLAYBACK_SPEED_KEY = 'playback_speed';

// 播放内容设置类型
export interface PlaybackContentSettings {
  includeSimpleAnswer: boolean; // 是否包含精简答案
  includeDetailAnswer: boolean; // 是否包含扩展答案
}

// 默认播放内容设置
export const DEFAULT_PLAYBACK_CONTENT_SETTINGS: PlaybackContentSettings = {
  includeSimpleAnswer: true,
  includeDetailAnswer: true,
};

// 默认播放速度
const DEFAULT_PLAYBACK_SPEED = 1.0;

// 设置音频映射表（由 App.tsx 调用）
export const setSoundMap = (map: Record<string, any>) => {
  soundMap = map;
};

// 设置全局初始化状态（由 App.tsx 调用）
export const setGlobalTrackPlayerInitialized = (initialized: boolean) => {
  isGlobalTrackPlayerInitialized = initialized;
};

export interface AudioPlaybackInfo {
  currentItemId: string | null;
  previousItemId: string | null; // 新增前一个音频的ID
  state: State;
  currentAudioIndex: number; // 0: question_markdown, 1: answer_simple_markdown, 2: answer_detail_markdown
  totalAudios: number;
}

export type AudioPlaybackListener = (info: AudioPlaybackInfo) => void;

class AudioManagerService {
  private currentItemId: string | null = null;
  private previousItemId: string | null = null; // 新增前一个音频的ID
  private currentAudioIndex: number = 0;
  private audioQueue: string[] = [];
  private playbackState: State = State.None;
  private listeners: Map<string, AudioPlaybackListener> = new Map();
  private isTrackPlayerInitialized: boolean = false;
  private playbackContentSettings: PlaybackContentSettings = DEFAULT_PLAYBACK_CONTENT_SETTINGS;
  private playbackSpeed: number = DEFAULT_PLAYBACK_SPEED; // 添加播放速度缓存

  // 检查并确保 TrackPlayer 已就绪
  private async ensureTrackPlayerReady(): Promise<void> {
    if (this.isTrackPlayerInitialized) return;

    try {
      // 如果已经在 App.tsx 中全局初始化，直接标记为已初始化
      if (isGlobalTrackPlayerInitialized) {
        this.isTrackPlayerInitialized = true;
        console.log('TrackPlayer 已在 App.tsx 中全局初始化');

        // 加载用户的播放设置
        await this.loadPlaybackContentSettings();
        await this.loadPlaybackSpeed(); // 加载播放速度设置

        // 设置播放完成事件监听
        this.setupTrackPlayerEvents();

        // 应用保存的播放速度
        if (this.playbackSpeed !== DEFAULT_PLAYBACK_SPEED) {
          await TrackPlayer.setRate(this.playbackSpeed);
          console.log(`应用保存的播放速度: ${this.playbackSpeed}x`);
        } else {
          // 确保TrackPlayer的速度与默认速度一致
          const currentRate = await TrackPlayer.getRate();
          if (currentRate !== DEFAULT_PLAYBACK_SPEED) {
            await TrackPlayer.setRate(DEFAULT_PLAYBACK_SPEED);
            console.log(`重置播放速度为默认值: ${DEFAULT_PLAYBACK_SPEED}x`);
          }
        }

        return;
      }

      // 否则尝试初始化（备用方案）
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        progressUpdateEventInterval: 1000,
      });
      this.isTrackPlayerInitialized = true;
      console.log('TrackPlayer 本地初始化成功');

      // 加载用户的播放设置
      await this.loadPlaybackContentSettings();
      await this.loadPlaybackSpeed(); // 加载播放速度设置

      // 应用保存的播放速度
      if (this.playbackSpeed !== DEFAULT_PLAYBACK_SPEED) {
        await TrackPlayer.setRate(this.playbackSpeed);
        console.log(`应用保存的播放速度: ${this.playbackSpeed}x`);
      }

      // 设置播放完成事件监听
      this.setupTrackPlayerEvents();
    } catch (error: any) {
      // 如果初始化失败，检查是否是因为已经初始化过
      if (error.message.includes('already been initialized')) {
        console.log('TrackPlayer 已经初始化过');
        this.isTrackPlayerInitialized = true;

        // 加载用户的播放设置
        await this.loadPlaybackContentSettings();
        await this.loadPlaybackSpeed(); // 加载播放速度设置

        // 应用保存的播放速度
        if (this.playbackSpeed !== DEFAULT_PLAYBACK_SPEED) {
          await TrackPlayer.setRate(this.playbackSpeed);
          console.log(`应用保存的播放速度: ${this.playbackSpeed}x`);
        }

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
      this.playbackState = State.Ended;
      this.previousItemId = this.currentItemId; // 切换到下一个音频时，更新前一个音频的ID
      this.currentItemId = null;
      this.currentAudioIndex = 0;
      this.audioQueue = [];

      this.notifyListeners();
    });

    // todo 事件名称已废弃，改成PlaybackActiveTrackChanged
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
      if ([State.Playing, State.Buffering, State.Paused].includes(data.state)) {
        this.playbackState = data.state;
      } else if (data.state === State.Stopped || data.state === State.None) {
        this.playbackState = State.None;
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
      totalAudios: this.audioQueue.length,
      previousItemId: this.previousItemId,
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
    } catch (error: any) {
      console.warn('停止播放时出错:', error);
    }

    this.currentItemId = null;
    this.currentAudioIndex = 0;
    this.audioQueue = [];
    this.playbackState = State.None;
    this.notifyListeners();
  }

  // 暂停当前播放
  public async pauseCurrent(): Promise<void> {
    if (this.playbackState === 'playing') {
      try {
        if (this.isTrackPlayerInitialized) {
          await TrackPlayer.pause();
        }
        this.playbackState = State.Paused;
        this.notifyListeners();
      } catch (error: any) {
        console.error('暂停播放失败:', error);
      }
    }
  }

  // 恢复播放
  public async resumeCurrent(): Promise<void> {
    if (this.playbackState === State.Paused) {
      try {
        if (this.isTrackPlayerInitialized) {
          await TrackPlayer.play();
          this.playbackState = State.Playing;
          this.notifyListeners();
        }
      } catch (error: any) {
        console.error('恢复播放失败:', error);
        this.handlePlaybackError();
      }
    }
  }

  // 加载播放内容设置
  public async loadPlaybackContentSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem(PLAYBACK_CONTENT_SETTINGS_KEY);
      console.log('本地缓存savedSettings', savedSettings)
      if (savedSettings) {
        const settings = JSON.parse(savedSettings) as PlaybackContentSettings;

        // 确保至少有一个选项被选中
        if (settings.includeSimpleAnswer || settings.includeDetailAnswer) {
          this.playbackContentSettings = settings;
          console.log('播放内容设置已加载:', this.playbackContentSettings);
        } else {
          // 如果两个都未选中，则使用默认设置
          console.warn('无效的播放内容设置，使用默认设置');
          this.playbackContentSettings = DEFAULT_PLAYBACK_CONTENT_SETTINGS;
          await this.savePlaybackContentSettings();
        }
      } else {
        console.log('没有找到保存的播放内容设置，使用默认设置');
        // 保存默认设置
        await this.savePlaybackContentSettings();
      }
    } catch (error) {
      console.error('加载播放内容设置失败:', error);
      // 出错时使用默认设置
      this.playbackContentSettings = DEFAULT_PLAYBACK_CONTENT_SETTINGS;
    }
  }

  // 保存播放内容设置
  private async savePlaybackContentSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(PLAYBACK_CONTENT_SETTINGS_KEY, JSON.stringify(this.playbackContentSettings));
      console.log('播放内容设置已保存');
    } catch (error) {
      console.error('保存播放内容设置失败:', error);
    }
  }

  // 加载播放速度设置
  public async loadPlaybackSpeed(): Promise<void> {
    try {
      const savedSpeed = await AsyncStorage.getItem(PLAYBACK_SPEED_KEY);
      if (savedSpeed) {
        const speed = parseFloat(savedSpeed);
        if (!isNaN(speed) && speed >= 0.5 && speed <= 2.0) {
          this.playbackSpeed = speed;
          console.log('播放速度已加载:', this.playbackSpeed);
        } else {
          console.warn('无效的播放速度设置，使用默认速度');
          this.playbackSpeed = DEFAULT_PLAYBACK_SPEED;
        }
      } else {
        console.log('没有找到保存的播放速度，使用默认速度');
        this.playbackSpeed = DEFAULT_PLAYBACK_SPEED;
      }
    } catch (error) {
      console.error('加载播放速度失败:', error);
      this.playbackSpeed = DEFAULT_PLAYBACK_SPEED;
    }
  }

  // 保存播放速度设置
  private async savePlaybackSpeed(): Promise<void> {
    try {
      await AsyncStorage.setItem(PLAYBACK_SPEED_KEY, this.playbackSpeed.toString());
      console.log('播放速度已保存:', this.playbackSpeed);
    } catch (error) {
      console.error('保存播放速度失败:', error);
    }
  }

  // 设置播放内容选项
  public async setPlaybackContentSettings(settings: PlaybackContentSettings): Promise<void> {
    // 确保至少有一个选项被选中
    if (!settings.includeSimpleAnswer && !settings.includeDetailAnswer) {
      throw new Error('至少需要选择一个播放内容选项');
    }

    this.playbackContentSettings = settings;
    await this.savePlaybackContentSettings();
  }

  // 获取当前播放内容设置
  public getPlaybackContentSettings(): PlaybackContentSettings {
    return { ...this.playbackContentSettings };
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
        // 如果是同一个项目但状态是 State.None，重新构建队列
        await this.stopCurrent();
      }

      // 根据用户设置构建音频队列
      this.audioQueue = [];
      if (audioFiles.audio_question) this.audioQueue.push(audioFiles.audio_question);
      if (this.playbackContentSettings.includeSimpleAnswer && audioFiles.audio_answer_simple) {
        this.audioQueue.push(audioFiles.audio_answer_simple);
      }
      if (this.playbackContentSettings.includeDetailAnswer && audioFiles.audio_answer_detail) {
        this.audioQueue.push(audioFiles.audio_answer_detail);
      }

      if (this.audioQueue.length === 0) {
        console.warn('No audio files available for playback');
        return;
      }

      this.currentItemId = itemId;
      this.currentAudioIndex = 0;
      await this.playCurrentAudioWithTrackPlayer();
    } catch (error: any) {
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
        }).filter((track): track is NonNullable<typeof track> => track !== null);

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
      this.playbackState = State.Playing;
      this.notifyListeners();

    } catch (error: any) {
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
    this.playbackState = State.Error;
    this.notifyListeners();

    // 3秒后重置状态
    setTimeout(() => {
      this.stopCurrent();
    }, 3000);
  }

  // 设置播放速度
  public async setPlaybackSpeed(speed: number): Promise<void> {
    try {
      // 验证速度值的有效性
      if (speed < 0.5 || speed > 2.0) {
        throw new Error('播放速度必须在0.5x到2.0x之间');
      }

      this.playbackSpeed = speed; // 更新缓存
      await this.savePlaybackSpeed(); // 保存到本地存储

      if (this.isTrackPlayerInitialized) {
        await TrackPlayer.setRate(speed);
        console.log(`设置播放速度为: ${speed}x`);
      }
    } catch (error: any) {
      console.error('设置播放速度失败:', error);
      throw error;
    }
  }

  // 获取当前播放速度
  public async getPlaybackSpeed(): Promise<number> {
    try {
      if (this.isTrackPlayerInitialized) {
        const rate = await TrackPlayer.getRate();
        console.log(`当前播放速度: ${rate}x`);
        // 确保缓存的速度与TrackPlayer的实际速度一致
        if (rate !== this.playbackSpeed) {
          this.playbackSpeed = rate;
          await this.savePlaybackSpeed();
        }
        return rate;
      }
    } catch (error: any) {
      console.error('获取播放速度失败:', error);
    }

    // 如果TrackPlayer未初始化，返回缓存的速度值
    console.log(`返回缓存的播放速度: ${this.playbackSpeed}x`);
    return this.playbackSpeed;
  }

  // 获取当前播放信息
  public getCurrentPlaybackInfo(): AudioPlaybackInfo {
    return {
      currentItemId: this.currentItemId,
      previousItemId: this.previousItemId,
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