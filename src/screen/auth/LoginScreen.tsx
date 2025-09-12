import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {routeNameMap} from '@/navigation/constant';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuthContext} from '@/contexts/AuthContext';

/**
 * 用户登录页面组件
 * 演示如何使用认证上下文进行用户登录操作
 */
const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState(''); // 用户名或邮箱
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>(
    'username',
  ); // 登录方式

  // 使用认证上下文
  const {login, logout, isLoading} = useAuthContext();

  /**
   * 处理用户登录
   * 使用认证上下文进行登录
   */
  const handleLogin = async () => {
    // 简单的输入验证
    if (!identifier.trim() || !password.trim()) {
      return;
    }

    try {
      // 调用登录API（通过上下文）
      const success = await login(
        identifier,
        password,
        loginMethod === 'email',
      );

      if (success) {
        Alert.alert(
          '登录成功',
          '欢迎回来！',
          [
            {
              text: '确定',
              onPress: () => {
                // 导航到首页或其他需要登录的页面, 直接导航到homeScreen会失败，因为他们处于不同stack
                navigation.navigate(routeNameMap.homeTab as never);
              },
            },
          ],
          {cancelable: false},
        );
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  /**
   * 处理用户退出登录
   * 使用认证上下文进行退出登录
   */
  const handleLogout = async () => {
    try {
      // 使用上下文进行退出登录
      await logout();

      // 重置输入字段
      setIdentifier('');
      setPassword('');

      Alert.alert('退出成功', '您已成功退出登录');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 添加切换登录方式的组件
  const renderLoginMethodToggle = () => (
    <View style={styles.loginMethodToggle}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          loginMethod === 'username' && styles.toggleButtonActive,
        ]}
        onPress={() => setLoginMethod('username')}>
        <Text
          style={[
            styles.toggleButtonText,
            loginMethod === 'username' && styles.toggleButtonTextActive,
          ]}>
          用户名
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          loginMethod === 'email' && styles.toggleButtonActive,
        ]}
        onPress={() => setLoginMethod('email')}>
        <Text
          style={[
            styles.toggleButtonText,
            loginMethod === 'email' && styles.toggleButtonTextActive,
          ]}>
          邮箱
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top + 20}]}>
      <View style={styles.header}>
        <Text style={styles.title}>用户登录</Text>
        <Text style={styles.subtitle}>请输入您的登录信息</Text>
      </View>

      <View style={styles.formContainer}>
        {renderLoginMethodToggle()}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {loginMethod === 'username' ? '用户名' : '邮箱'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`请输入${
              loginMethod === 'username' ? '用户名' : '邮箱'
            }`}
            placeholderTextColor="#999"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize={loginMethod === 'email' ? 'none' : 'sentences'}
            keyboardType={loginMethod === 'email' ? 'email-address' : 'default'}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>登录</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>退出登录 (演示)</Text>
        </TouchableOpacity>

        {/* 注册和忘记密码链接 */}
        <View style={styles.additionalActions}>
          <TouchableOpacity
            onPress={() => {
              (navigation as any).navigate(routeNameMap.registerScreen);
            }}>
            <Text style={styles.actionLinkText}>新用户注册</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              (navigation as any).navigate(routeNameMap.forgotPasswordScreen);
            }}>
            <Text style={styles.actionLinkText}>忘记密码？</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate(routeNameMap.homeScreen as never)}
          activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>跳过登录，继续使用</Text>
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
  // 登录方式切换样式
  loginMethodToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  // 输入框样式
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
  // 按钮样式
  loginButton: {
    height: 50,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    height: 50,
    backgroundColor: '#F44336',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // 附加操作样式
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  actionLinkText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '500',
  },
  // 跳过登录样式
  skipButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  skipButtonText: {
    color: '#6200EE',
    fontSize: 16,
  },
});

export default LoginScreen;
