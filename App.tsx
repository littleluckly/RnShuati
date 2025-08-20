// App.tsx
import 'react-native-get-random-values'; // ✅ 必须放在最前面
import React, {forwardRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootStack from '@/navigation/RootStack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import Toast from 'react-native-toast-message';

// 使用forwardRef转发Toast组件的ref
const ToastComponent = forwardRef((props, ref) => {
  return <Toast ref={ref} {...props} />;
});

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <>
          <PaperProvider>
            <NavigationContainer>
              <RootStack />
            </NavigationContainer>
          </PaperProvider>
          <ToastComponent />
        </>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
// import React from 'react';
// import {Button, StyleSheet, View} from 'react-native';
// import Animated, {useSharedValue, withSpring} from 'react-native-reanimated';

// export default function App() {
//   const width = useSharedValue<number>(100);

//   const handlePress = () => {
//     width.value = withSpring(width.value - 10);
//   };
//   const handleAddPress = () => {
//     width.value = withSpring(width.value + 10);
//   };

//   return (
//     <View style={styles.container}>
//       <Animated.View style={{...styles.box, width}} />
//       <Button onPress={handlePress} title="Click me" />
//       <Button onPress={handleAddPress} title="Click me +" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   box: {
//     height: 100,
//     backgroundColor: '#b58df1',
//     borderRadius: 20,
//     marginVertical: 64,
//   },
// });
