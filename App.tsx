// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootStack from '@/navigation/RootStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
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
