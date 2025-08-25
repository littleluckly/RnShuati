import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {IconButton} from 'react-native-paper';

const {width} = Dimensions.get('window');

export interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  icon?: string;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 确认对话框组件 - 遵循业界最佳实践
 *
 * 设计原则：
 * 1. 明确的操作意图说明
 * 2. 突出显示危险操作（红色确认按钮）
 * 3. 提供恢复路径信息
 * 4. 易于理解的按钮文案
 * 5. 适当的视觉层级
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmButtonColor = '#FF4757', // 危险操作使用红色
  icon = 'delete-outline',
  iconColor = '#FF4757',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      {/* 半透明遮罩 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}>
        {/* 对话框容器 */}
        <TouchableOpacity
          style={styles.dialogContainer}
          activeOpacity={1}
          onPress={() => {}} // 阻止事件冒泡
        >
          <View style={styles.dialog}>
            {/* 标题 */}
            <Text style={styles.title}>{title}</Text>

            {/* 消息内容 - 支持换行符 */}
            <View style={styles.messageContainer}>
              {message.split('\\n').map((line, index) => (
                <Text key={index} style={styles.message}>
                  {line}
                </Text>
              ))}
            </View>

            {/* 按钮组 */}
            <View style={styles.buttonContainer}>
              {/* 取消按钮 - 次要操作 */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              {/* 确认按钮 - 主要操作（危险） */}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  {backgroundColor: confirmButtonColor},
                ]}
                onPress={onConfirm}
                activeOpacity={0.8}>
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: width * 0.85,
    maxWidth: 340,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    borderRadius: 28,
    margin: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    // backgroundColor 在组件中动态设置
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ConfirmDialog;
