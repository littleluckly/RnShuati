import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getUserLoginInfo, loginUser, logoutUser, UserLoginInfo } from '../utils/userStorageUtils';
import { authApiService } from '../services';

/**
 * 认证上下文状态接口
 */
interface AuthContextState {
  userInfo: UserLoginInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, isEmail?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

/**
 * 认证上下文接口
 */
interface AuthProviderProps {
  children: ReactNode;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * 认证上下文提供者组件
 * 管理用户的认证状态和提供认证相关的方法
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserLoginInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 初始化时检查用户的认证状态
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 检查用户的认证状态
   * 从本地存储中获取用户信息并验证token的有效性
   */
  const checkAuthStatus = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const savedUserInfo = await getUserLoginInfo();
      
      if (savedUserInfo) {
        try {
          // 调用API验证token的有效性
          const response = await authApiService.getUserInfo(savedUserInfo.token);
          
          if (response.success && response.data && response.data.isLoggedIn) {
            // Token有效，更新用户信息并设置认证状态
            const updatedUserInfo: UserLoginInfo = {
              ...savedUserInfo,
              email: response.data.email || savedUserInfo.email,
              lastLogin: response.data.lastLogin || savedUserInfo.lastLogin,
            };
            
            setUserInfo(updatedUserInfo);
            setIsAuthenticated(true);
          } else {
            // Token无效，清除本地存储并设置未认证状态
            console.warn('Token is invalid or expired');
            await logoutUser();
            setUserInfo(null);
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          // API调用失败，可能是网络问题，暂时信任本地存储的信息
          console.warn('Failed to validate token with server, using local data:', apiError);
          setUserInfo(savedUserInfo);
          setIsAuthenticated(true);
        }
      } else {
        // 没有保存的用户信息，设置未认证状态
        setUserInfo(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUserInfo(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户登录方法
   * @param identifier 用户名或邮箱
   * @param password 密码
   * @param isEmail 是否使用邮箱登录（默认为false）
   * @returns Promise<boolean> 登录是否成功
   */
  const login = async (
    identifier: string,
    password: string,
    isEmail: boolean = false
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 调用登录API
      const response = await authApiService.login(identifier, password, isEmail);
      
      if (response.success && response.data) {
        // 登录成功，保存用户信息
        const loginInfo: UserLoginInfo = {
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          token: response.data.token,
          lastLogin: response.data.lastLogin,
          email: response.data.email,
        };
        
        await loginUser(loginInfo);
        
        // 更新状态
        setUserInfo(loginInfo);
        setIsAuthenticated(true);
        
        return true;
      } else {
        // 登录失败
        throw new Error(response.message || '用户名/邮箱或密码错误');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 用户退出登录方法
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 如果用户已登录，尝试调用退出登录API
      if (userInfo) {
        await authApiService.logout(userInfo.userId, userInfo.token);
      }
      
      // 清除本地存储的用户登录信息
      await logoutUser();
      
      // 更新状态
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // 即使API调用失败，也要清除本地存储的用户信息
      try {
        await logoutUser();
        setUserInfo(null);
        setIsAuthenticated(false);
      } catch (localError) {
        console.error('Error during logout cleanup:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 上下文值
  const contextValue: AuthContextState = {
    userInfo,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 自定义Hook，用于在组件中使用认证上下文
 * @returns AuthContextState 认证上下文状态和方法
 */
export const useAuthContext = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};