import AsyncStorage from "@react-native-async-storage/async-storage";

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
      console.error('Error setting loop mode:', error);
    }
  }

  async loadLocalLoopMode(): Promise<void> {
    try {
      const mode = await AsyncStorage.getItem(LOOP_MODE_KEY);
      if (mode) {
        this.loopMode = mode as LoopMode;
      }
    } catch (error) {
      console.error('Error loading loop mode:', error);
    }
  }

  async saveLocalLoopMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(LOOP_MODE_KEY, this.loopMode);
    } catch (error) {
      console.error('Error saving loop mode:', error);
    }
  }
}

export default new LoopAudioManager();