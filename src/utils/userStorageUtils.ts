/**
 * 用户存储工具
 * 用于管理匿名用户的userId和科目选择状态
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';

// 存储键名
const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id';
const SELECTED_SUBJECT_KEY = 'selected_subject';
const IS_LOGGED_IN_KEY = 'is_logged_in';

/**
 * 获取或创建匿名用户ID
 * 如果本地没有存储匿名用户ID，则生成一个新的并存储
 * @returns {Promise<string>} 匿名用户ID
 */
export const getOrCreateAnonymousUserId = async (): Promise<string> => {
  try {
    // 检查是否已登录
    const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
    if (isLoggedIn === 'true') {
      // 如果已登录，不返回匿名ID
      return '';
    }

    // 尝试获取已存储的匿名用户ID
    let userId = await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY);
    
    // 如果不存在，生成新的ID并存储
    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting or creating anonymous user ID:', error);
    // 出错时返回一个临时ID
    return `temp_${Date.now()}`;
  }
};

/**
 * 保存用户选择的科目
 * @param {string} subjectId 科目ID
 * @param {string} subjectName 科目名称
 */
export const saveSelectedSubject = async (
  subjectId: string,
  subjectName: string
): Promise<void> => {
  try {
    const subjectData = {
      subjectId,
      subjectName,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      SELECTED_SUBJECT_KEY,
      JSON.stringify(subjectData)
    );
  } catch (error) {
    console.error('Error saving selected subject:', error);
  }
};

/**
 * 获取用户选择的科目
 * @returns {Promise<{subjectId: string, subjectName: string} | null>} 科目信息或null
 */
export const getSelectedSubject = async (): Promise<
  {subjectId: string; subjectName: string} | null
> => {
  try {
    const subjectData = await AsyncStorage.getItem(SELECTED_SUBJECT_KEY);
    if (subjectData) {
      return JSON.parse(subjectData);
    }
    return null;
  } catch (error) {
    console.error('Error getting selected subject:', error);
    return null;
  }
};

/**
 * 清除匿名用户数据
 * 登录后调用
 */
export const clearAnonymousUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY);
    // 注意：保留已选择的科目
    // 标记为已登录
    await AsyncStorage.setItem(IS_LOGGED_IN_KEY, 'true');
  } catch (error) {
    console.error('Error clearing anonymous user data:', error);
  }
};

/**
 * 标记用户为已登录
 */
export const markUserAsLoggedIn = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(IS_LOGGED_IN_KEY, 'true');
  } catch (error) {
    console.error('Error marking user as logged in:', error);
  }
};

/**
 * 检查用户是否已登录
 * @returns {Promise<boolean>} 是否已登录
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
    return isLoggedIn === 'true';
  } catch (error) {
    console.error('Error checking if user is logged in:', error);
    return false;
  }
};

/**
 * 登出用户
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(IS_LOGGED_IN_KEY);
    // 保留已选择的科目和匿名用户ID
  } catch (error) {
    console.error('Error logging out user:', error);
  }
};