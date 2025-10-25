import AsyncStorage from "@react-native-async-storage/async-storage";
import { audioManager, AudioPlaybackInfo } from "./AudioManager";
import { Question } from "./apiTypes";
import { questionApiService } from "./index";

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
        
        try {
          // 在播放下一个音频前，检查并下载音频文件
          const [questionAudioPath, simpleAnswerPath, detailAnswerPath] = await Promise.all([
            nextQuestion.files.audio_question ? 
              this.downloadAudioIfNeeded(nextQuestion.files.audio_question) : 
              Promise.resolve(null),
            nextQuestion.files.audio_answer_simple ? 
              this.downloadAudioIfNeeded(nextQuestion.files.audio_answer_simple) : 
              Promise.resolve(null),
            nextQuestion.files.audio_answer_detail ? 
              this.downloadAudioIfNeeded(nextQuestion.files.audio_answer_detail) : 
              Promise.resolve(null),
          ]);
          
          // 使用下载后的本地文件路径播放音频
          await audioManager.startPlayback(nextQuestion._id, {
            audio_question: questionAudioPath || undefined,
            audio_answer_simple: simpleAnswerPath || undefined,
            audio_answer_detail: detailAnswerPath || undefined,
          }, true); // 传递当前为列表循环模式
          
          playbackInfo.previousItemId = playbackInfo.currentItemId; // 更新前一个音频的ID
          playbackInfo.currentItemId = nextQuestion._id;
        } catch (error) {
          console.error('播放下一个音频失败:', error);
          // 即使下载失败，也尝试播放（可能使用在线URL）
          await audioManager.startPlayback(nextQuestion._id, {
            audio_question: nextQuestion.files.audio_question,
            audio_answer_simple: nextQuestion.files.audio_answer_simple,
            audio_answer_detail: nextQuestion.files.audio_answer_detail,
          }, true);
        }
      }
    }
  }
  
  /**
   * 检查音频文件是否需要下载，如果需要则下载
   * @param fileName 音频文件名
   * @returns 本地文件路径或null（如果下载失败）
   */
  private async downloadAudioIfNeeded(fileName: string): Promise<string | null> {
    try {
      // 调用API服务下载音频文件，这里不需要进度回调
      const response = await questionApiService.downloadAudioFile(fileName);
      
      if (response.success && response.data) {
        return response.data; // 返回本地文件路径
      } else {
        console.error('下载音频文件失败:', response.message);
        return null;
      }
    } catch (error) {
      console.error('下载音频文件时发生错误:', error);
      return null;
    }
  }
}

export default new LoopAudioManager();