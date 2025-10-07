import AsyncStorage from "@react-native-async-storage/async-storage";
import { audioManager, AudioPlaybackInfo } from "./AudioManager";
import { Question } from "./apiTypes";

export enum LoopMode {
  None = 'none',
  List = 'list',
  Single = 'single',
}

const LOOP_MODE_KEY = 'loopMode';

class LoopAudioManager {
  loopMode: LoopMode = LoopMode.None;
  async setLoopMode(mode: LoopMode): Promise<void> {
    try {
      this.loopMode = mode;
      await this.saveLocalLoopMode(); // 保存到本地存储
    } catch (error) {
      console.error('设置循环模式失败:', error);
    }
  }

  async loadLocalLoopMode(): Promise<void> {
    try {
      const mode = await AsyncStorage.getItem(LOOP_MODE_KEY);
      if (mode) {
        this.loopMode = mode as LoopMode;
      }
    } catch (error) {
      console.error('加载循环模式失败:', error);
    }
  }

  async saveLocalLoopMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(LOOP_MODE_KEY, this.loopMode);
    } catch (error) {
      console.error('保存循环模式失败:', error);
    }
  }

  async playNext(questions: Question[], playbackInfo: AudioPlaybackInfo): Promise<void> {
    if (this.loopMode === LoopMode.List) {
      const currentIndex = questions.findIndex(q => q._id === playbackInfo.previousItemId);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % questions.length;
        const nextQuestion = questions[nextIndex];
        await audioManager.startPlayback(nextQuestion._id, {
          audio_question: nextQuestion.files.audio_question,
          audio_answer_simple: nextQuestion.files.audio_answer_simple,
          audio_answer_detail: nextQuestion.files.audio_answer_detail,
        }, true); // 传递当前为列表循环模式
        playbackInfo.previousItemId = playbackInfo.currentItemId; // 更新前一个音频的ID
        playbackInfo.currentItemId = nextQuestion._id;
      }
    }
  }
}

export default new LoopAudioManager();