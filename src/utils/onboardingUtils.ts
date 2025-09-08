import AsyncStorage from '@react-native-async-storage/async-storage';

// 新手引导相关的键名
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const LAST_ONBOARDING_DATE_KEY = 'last_onboarding_date';
const SKIP_ONBOARDING_KEY = 'skip_onboarding';

/**
 * 检查是否需要显示新手引导
 * @returns {Promise<boolean>} 是否需要显示新手引导
 */
export const shouldShowOnboarding = async (): Promise<boolean> => {
  try {
    // 检查用户是否选择跳过新手引导
    const skipOnboarding = await AsyncStorage.getItem(SKIP_ONBOARDING_KEY);
    if (skipOnboarding === 'true') {
      return false;
    }

    // 检查是否已经完成过新手引导
    const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (onboardingCompleted !== 'true') {
      return true;
    }

    // 检查上次显示新手引导的日期
    const lastOnboardingDate = await AsyncStorage.getItem(LAST_ONBOARDING_DATE_KEY);
    if (lastOnboardingDate) {
      const lastDate = new Date(lastOnboardingDate);
      const today = new Date();

      // 如果不是同一天，则需要重新显示新手引导
      if (
        lastDate.getFullYear() !== today.getFullYear() ||
        lastDate.getMonth() !== today.getMonth() ||
        lastDate.getDate() !== today.getDate()
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * 标记新手引导已完成
 */
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    await AsyncStorage.setItem(LAST_ONBOARDING_DATE_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
  }
};

/**
 * 设置是否跳过新手引导
 * @param {boolean} skip 是否跳过新手引导
 */
export const setSkipOnboarding = async (skip: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(SKIP_ONBOARDING_KEY, skip ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting skip onboarding:', error);
  }
};

/**
 * 重置新手引导状态
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    await AsyncStorage.removeItem(LAST_ONBOARDING_DATE_KEY);
    await AsyncStorage.removeItem(SKIP_ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};