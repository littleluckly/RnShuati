// App.tsx
import 'react-native-get-random-values'; // ✅ 必须放在最前面
import React, {forwardRef, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootStack from '@/navigation/RootStack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {SharedTransitionProvider} from '@/contexts/sharedTransitionContext';
import {AuthProvider} from '@/contexts/AuthContext';
import TrackPlayer, { Capability } from 'react-native-track-player';

// 使用forwardRef转发Toast组件的ref
const ToastComponent = forwardRef<any, any>((props, ref) => {
  return <Toast {...props} />;
});

export default function App() {
  // 全局初始化音频播放器
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        
        // 配置播放器能力选项
        await TrackPlayer.updateOptions({
          // 启用音频控制中心和控制中心的能力
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
          ],
          // 紧凑模式下的按钮
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          // 通知栏设置
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          // 进度更新间隔（毫秒）
          progressUpdateEventInterval: 1000,
        });
        
        console.log('TrackPlayer 初始化成功');
      } catch (error) {
        console.error('TrackPlayer 初始化失败:', error);
      }
    };

    setupPlayer();

    // 清理函数
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <SharedTransitionProvider>
          <AuthProvider>
            <PaperProvider>
              <RootStack />
            </PaperProvider>
          </AuthProvider>
        </SharedTransitionProvider>
        <ToastComponent />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
