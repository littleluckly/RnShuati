import Toast from 'react-native-toast-message';

/**
 * Toast 工具库 - 统一管理应用中的提示消息
 * 
 * 使用示例：
 * import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastUtils';
 * 
 * // 显示成功消息
 * showSuccessToast('操作成功');
 * 
 * // 显示错误消息
 * showErrorToast('操作失败', '错误');
 * 
 * // 显示信息提示
 * showInfoToast('请注意');
 * 
 * // 自定义配置
 * showToast({
 *   title: '自定义标题',
 *   message: '自定义消息',
 *   type: 'success',
 *   duration: 1500,
 *   topOffset: 80
 * });
 */

// Toast 配置类型定义
export interface ToastConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  topOffset?: number;
}

/**
 * 显示自定义样式的 Toast 提示
 * @param config Toast 配置参数
 */
export const showToast = ({
  title = '提示',
  message,
  type = 'info',
  duration = 800,
  topOffset = 60, // 默认距离顶部导航8px（导航高度约52px + 8px间距）
}: ToastConfig) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
    topOffset,
    // @ts-ignore 忽略类型检查，因为 ToastShowParams 中可能缺少 customStyles 属性
    customStyles: {
      container: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
      },
      text1: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
      },
      text2: {
        color: '#fff',
        fontSize: 13,
      },
    },
  });
};

/**
 * 显示成功提示
 * @param message 提示消息
 * @param title 标题（可选）
 */
export const showSuccessToast = (message: string, title?: string) => {
  showToast({
    title: title || '成功',
    message,
    type: 'success',
  });
};

/**
 * 显示错误提示
 * @param message 提示消息
 * @param title 标题（可选）
 */
export const showErrorToast = (message: string, title?: string) => {
  showToast({
    title: title || '错误',
    message,
    type: 'error',
  });
};

/**
 * 显示信息提示
 * @param message 提示消息
 * @param title 标题（可选）
 */
export const showInfoToast = (message: string, title?: string) => {
  showToast({
    title: title || '提示',
    message,
    type: 'info',
  });
};

/**
 * 显示滑动限制提示（用于卡片边界提示）
 */
export const showSwipeLimitToast = () => {
  showInfoToast('已经是第一张卡片啦');
};