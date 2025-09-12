// App.tsx
import 'react-native-get-random-values'; // ✅ 必须放在最前面
import React, {forwardRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootStack from '@/navigation/RootStack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {SharedTransitionProvider} from '@/contexts/sharedTransitionContext';

// 使用forwardRef转发Toast组件的ref
const ToastComponent = forwardRef<any, any>((props, ref) => {
  return <Toast {...props} />;
});

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <SharedTransitionProvider>
          <PaperProvider>
            <RootStack />
          </PaperProvider>
        </SharedTransitionProvider>
        <ToastComponent />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
