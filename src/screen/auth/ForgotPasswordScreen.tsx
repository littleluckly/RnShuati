import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { routeNameMap } from '@/navigation/constant';
import { authApiService } from '@/services';

/**
 * 忘记密码页面组件
 * 提供通过邮箱找回密码的功能
 */
const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 表单状态
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verification' | 'reset'>('email');
  const [countdown, setCountdown] = useState(0);

  /**
   * 处理发送验证码
   */
  const handleSendVerificationCode = async () => {
    // 验证邮箱格式
    if (!email.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      Alert.alert('输入错误', '请输入有效的邮箱地址');
      return;
    }

    setIsLoading(true);
    try {
      // 调用忘记密码API，发送验证码
      // 注意：这里假设后端API使用email字符串作为参数
      // 如果需要其他参数格式，需要根据实际情况调整
      const response = await authApiService.forgotPassword(email);

      if (response.success) {
        // 验证码发送成功，进入下一步
        Alert.alert('发送成功', '验证码已发送至您的邮箱，请查收');
        setStep('verification');
        startCountdown();
        Keyboard.dismiss();
      } else {
        // 发送失败
        throw new Error(response.message || '验证码发送失败，请稍后再试');
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      Alert.alert(
        '发送失败',
        error instanceof Error ? error.message : '网络错误，请稍后再试'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 启动倒计时
   */
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  /**
   * 处理验证验证码
   */
  const handleVerifyCode = () => {
    // 验证验证码是否为空且长度是否为6位
    if (!verificationCode.trim() || verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      Alert.alert('输入错误', '请输入6位数字验证码');
      return;
    }

    // 验证成功，进入重置密码步骤
    setStep('reset');
  };

  /**
   * 验证重置密码表单
   */
  const validateResetPasswordForm = (): { isValid: boolean; errorMessage?: string } => {
    // 检查新密码是否为空且长度是否足够
    if (!newPassword.trim()) {
      return { isValid: false, errorMessage: '请输入新密码' };
    }

    if (newPassword.length < 6) {
      return { isValid: false, errorMessage: '密码长度至少为6位' };
    }

    // 检查两次输入的密码是否一致
    if (newPassword !== confirmNewPassword) {
      return { isValid: false, errorMessage: '两次输入的密码不一致' };
    }

    return { isValid: true };
  };

  /**
   * 处理重置密码
   */
  const handleResetPassword = async () => {
    // 验证表单
    const validationResult = validateResetPasswordForm();
    if (!validationResult.isValid) {
      Alert.alert('输入错误', validationResult.errorMessage || '请检查输入信息');
      return;
    }

    setIsLoading(true);
    try {
      // 调用重置密码API
      // 注意：根据authApiService中的定义，resetPassword需要userId、resetToken和newPassword三个参数
      // 这里假设verificationCode可以作为resetToken使用，并且需要获取用户ID
      // 在实际应用中，应该根据后端API的实际要求调整
      const response = await authApiService.resetPassword(
        'temp-user-id', // 临时用户ID，实际应该从某处获取
        verificationCode,
        newPassword
      );

      if (response.success) {
        // 密码重置成功
        Alert.alert(
          '重置成功',
          '您的密码已重置成功，请使用新密码登录',
          [
            {
              text: '立即登录',
              onPress: () => {
                navigation.navigate(routeNameMap.loginScreen as never);
              },
            },
          ]
        );
      } else {
        // 重置失败
        throw new Error(response.message || '密码重置失败，请稍后再试');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        '重置失败',
        error instanceof Error ? error.message : '网络错误，请稍后再试'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 渲染邮箱输入步骤
   */
  const renderEmailStep = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>邮箱地址</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入您的邮箱地址"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        <Text style={styles.helpText}>
          我们将向您的邮箱发送验证码，用于重置密码
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSendVerificationCode}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>发送验证码</Text>
        )}
      </TouchableOpacity>
    </>
  );

  /**
   * 渲染验证码验证步骤
   */
  const renderVerificationStep = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>验证码</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入邮箱收到的6位验证码"
          placeholderTextColor="#999"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading}
        />
        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={countdown === 0 ? handleSendVerificationCode : undefined}
            disabled={countdown > 0 || isLoading}
          >
            <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
              {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>{email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleVerifyCode}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>验证并继续</Text>
        )}
      </TouchableOpacity>
    </>
  );

  /**
   * 渲染重置密码步骤
   */
  const renderResetStep = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>新密码</Text>
        <TextInput
          style={styles.input}
          placeholder="请设置新密码（至少6位）"
          placeholderTextColor="#999"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>确认新密码</Text>
        <TextInput
          style={styles.input}
          placeholder="请再次输入新密码"
          placeholderTextColor="#999"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleResetPassword}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>确认重置</Text>
        )}
      </TouchableOpacity>
    </>
  );

  /**
   * 获取当前步骤的标题
   */
  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return '找回密码';
      case 'verification':
        return '验证身份';
      case 'reset':
        return '重置密码';
      default:
        return '找回密码';
    }
  };

  /**
   * 获取当前步骤的副标题
   */
  const getStepSubtitle = () => {
    switch (step) {
      case 'email':
        return '请输入您注册时使用的邮箱';
      case 'verification':
        return '请输入收到的验证码';
      case 'reset':
        return '请设置新的密码';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{getStepTitle()}</Text>
        <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
      </View>

      <View style={styles.formContainer}>
        {/* 渲染当前步骤的表单 */}
        {step === 'email' && renderEmailStep()}
        {step === 'verification' && renderVerificationStep()}
        {step === 'reset' && renderResetStep()}

        {/* 返回按钮或返回上一步按钮 */}
        {step === 'email' ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step === 'verification' ? 'email' : 'verification')}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>返回上一步</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resendText: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#CCC',
    fontWeight: 'normal',
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#6200EE',
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;