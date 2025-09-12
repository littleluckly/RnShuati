import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { routeNameMap } from '@/navigation/constant';
import { authApiService } from '@/services';

/**
 * 用户注册页面组件
 * 提供用户名、密码和可选邮箱的注册功能
 */
const RegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTooltipVisible, setEmailTooltipVisible] = useState(false);

  /**
   * 表单验证函数
   * @returns 验证是否通过，以及可能的错误信息
   */
  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    // 检查用户名是否为空
    if (!username.trim()) {
      return { isValid: false, errorMessage: '请输入用户名' };
    }

    // 检查密码是否为空且长度是否足够
    if (!password.trim()) {
      return { isValid: false, errorMessage: '请输入密码' };
    }

    if (password.length < 6) {
      return { isValid: false, errorMessage: '密码长度至少为6位' };
    }

    // 检查两次输入的密码是否一致
    if (password !== confirmPassword) {
      return { isValid: false, errorMessage: '两次输入的密码不一致' };
    }

    // 检查邮箱格式是否正确（如果输入了邮箱）
    if (email.trim() && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return { isValid: false, errorMessage: '请输入有效的邮箱地址' };
    }

    return { isValid: true };
  };

  /**
   * 处理用户注册
   * 进行表单验证并调用注册API
   */
  const handleRegister = async () => {
    // 验证表单
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      Alert.alert('注册失败', validationResult.errorMessage || '请检查输入信息');
      return;
    }

    setIsLoading(true);
    try {
      // 调用注册API
      const response = await authApiService.register(
        username,
        password,
        email.trim() || undefined
      );

      if (response.success) {
        // 注册成功
        Alert.alert(
          '注册成功',
          email ? 
            '注册成功！请登录您的账号。\n注意：如果您忘记密码，可以通过邮箱找回。' : 
            '注册成功！请登录您的账号。\n注意：由于您没有提供邮箱，如果忘记密码将无法找回。',
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
        // 注册失败
        throw new Error(response.message || '注册失败，请稍后再试');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert(
        '注册失败',
        error instanceof Error ? error.message : '网络错误，请稍后再试'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 切换邮箱提示框的显示状态
   */
  const toggleEmailTooltip = () => {
    setEmailTooltipVisible(!emailTooltipVisible);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>用户注册</Text>
        <Text style={styles.subtitle}>创建一个新的账号</Text>
      </View>

      <View style={styles.formContainer}>
        {/* 用户名输入框 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>用户名</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入用户名"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* 邮箱输入框和提示 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>邮箱 (选填)</Text>
            <TouchableOpacity onPress={toggleEmailTooltip}>
              <Text style={styles.tooltipIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="请输入邮箱地址（用于找回密码）"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          
          {emailTooltipVisible && (
            <Text style={styles.tooltipText}>
              提供邮箱可在忘记密码时进行找回，不提供则无法找回密码
            </Text>
          )}
        </View>

        {/* 密码输入框 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请设置密码（至少6位）"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* 确认密码输入框 */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>确认密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请再次输入密码"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* 注册按钮 */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>注册</Text>
          )}
        </TouchableOpacity>

        {/* 已有账号，去登录 */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>已有账号？</Text>
          <TouchableOpacity onPress={() => navigation.navigate(routeNameMap.loginScreen as never)}>
            <Text style={styles.loginLink}> 立即登录</Text>
          </TouchableOpacity>
        </View>

        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
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
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
  },
  tooltipIcon: {
    fontSize: 16,
  },
  tooltipText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  registerButton: {
    height: 50,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: '500',
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

export default RegisterScreen;