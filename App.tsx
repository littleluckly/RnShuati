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
import {
  safeInitializeTrackPlayer,
  resetTrackPlayer,
} from '@/services/TrackPlayerInitializer';
import {setSoundMap} from '@/services/AudioManager';
import soundMap from '@/assets/question-audios/soundMap';

// 使用forwardRef转发Toast组件的ref
const ToastComponent = forwardRef<any, any>((props, ref) => {
  return <Toast {...props} />;
});

export default function App() {
  // 全局初始化音频播放器
  useEffect(() => {
    // 设置音频映射表，提前加载所有音频资源引用
    setSoundMap(soundMap);
    console.log('📻 音频映射表已在 App.tsx 中提前加载完成');
    
    // 安全初始化 TrackPlayer
    safeInitializeTrackPlayer();

    // 清理函数
    return () => {
      resetTrackPlayer();
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
